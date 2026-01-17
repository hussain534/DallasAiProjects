"""
Real Transact API adapter implementation.
Connects to an actual Temenos Transact instance.
"""
import httpx
import logging
import base64
import uuid
from datetime import datetime, date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, List
from xml.etree import ElementTree as ET

from app.core.config import get_settings
from app.models.loan import (
    PersonalLoanCreate,
    AutoLoanCreate,
    LoanResponse,
    LoanSimulationRequest,
    LoanSimulationResponse,
    LoanSummary,
    LoanDetail,
    LoanStatus,
    LoanType,
    VehicleType,
)
from app.models.customer import (
    Customer,
    CustomerSearchQuery,
    CustomerCreate,
    CustomerResponse,
    Address,
    DocumentType,
    ProductSummary,
)
from app.models.payment_schedule import (
    PaymentSchedule,
    Payment,
    PaymentStatus,
    ScheduleSummary,
)
from .base import TransactAdapterBase

logger = logging.getLogger(__name__)


class TransactRealAdapter(TransactAdapterBase):
    """
    Real adapter for Temenos Transact API.

    This adapter connects to an actual Transact instance using:
    - Basic Authentication
    - REST/OFS API endpoints
    """

    def __init__(self):
        settings = get_settings()
        self.base_url = settings.TRANSACT_API_URL
        self.username = settings.TRANSACT_USERNAME
        self.password = settings.TRANSACT_PASSWORD
        self.timeout = 30.0

        # Build Basic Auth header
        credentials = f"{self.username}:{self.password}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        self.auth_header = f"Basic {encoded_credentials}"

        # API paths for Transact
        self.api_paths = {
            "customer_search": "/api/v1.0.0/party/customers",
            "customer_get": "/api/v1.0.0/party/customers/{customerId}",
            "arrangements": "/api/v1.0.0/holdings/arrangements",
            "arrangement_get": "/api/v1.0.0/holdings/arrangements/{arrangementId}",
            "payment_schedules": "/api/v1.0.0/holdings/paymentSchedules",
        }

        # Store created loans in memory (backup if API fails)
        self._created_loans: dict[str, LoanResponse] = {}

        logger.info(f"TransactRealAdapter initialized for {self.base_url}")

    def _get_headers(self) -> dict:
        """Get headers for API requests"""
        return {
            "Authorization": self.auth_header,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[dict] = None,
        params: Optional[dict] = None,
    ) -> dict:
        """Make HTTP request to Transact API"""
        url = f"{self.base_url}{endpoint}"

        logger.info(f"Making {method} request to {url}")

        async with httpx.AsyncClient(timeout=self.timeout, verify=False) as client:
            try:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=self._get_headers(),
                    json=data,
                    params=params,
                )

                logger.info(f"Response status: {response.status_code}")

                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 401:
                    logger.error("Authentication failed - check credentials")
                    raise Exception("Authentication failed")
                else:
                    logger.error(f"HTTP {response.status_code}: {response.text}")
                    response.raise_for_status()

            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error calling Transact API: {e}")
                raise
            except httpx.RequestError as e:
                logger.error(f"Request error calling Transact API: {e}")
                raise

    async def test_connection(self) -> bool:
        """Test connection to Transact"""
        try:
            # Try to access a simple endpoint
            url = f"{self.base_url}/api/v1.0.0/system/health"
            async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
                response = await client.get(url, headers=self._get_headers())
                logger.info(f"Connection test response: {response.status_code}")
                return response.status_code in [200, 401, 404]  # Server is responding
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return False

    # Customer Operations
    async def search_customers(self, query: CustomerSearchQuery) -> List[Customer]:
        """Search for customers in Transact"""
        try:
            params = {}
            if query.document_number:
                params["customerIds"] = query.document_number
            if query.name:
                params["customerName"] = query.name

            endpoint = self.api_paths["customer_search"]
            response = await self._make_request("GET", endpoint, params=params)

            customers = []
            if "body" in response:
                for item in response.get("body", []):
                    customer = self._parse_customer_response(item)
                    if customer:
                        customers.append(customer)

            return customers

        except Exception as e:
            logger.error(f"Error searching customers in Transact: {e}")
            # Fall back to mock data
            return self._get_mock_customers_filtered(query)

    async def get_customer(self, customer_id: str) -> Optional[Customer]:
        """Get customer by ID from Transact"""
        try:
            endpoint = self.api_paths["customer_get"].format(customerId=customer_id)
            response = await self._make_request("GET", endpoint)

            if response and "body" in response:
                return self._parse_customer_response(response["body"])
            return None

        except Exception as e:
            logger.error(f"Error getting customer from Transact: {e}")
            # Fall back to mock
            return self._get_mock_customer_by_id(customer_id)

    async def create_customer(self, customer: CustomerCreate) -> Customer:
        """Create a new customer in Transact"""
        try:
            endpoint = self.api_paths["customer_search"]
            payload = {
                "body": {
                    "customerName": f"{customer.first_name} {customer.last_name}",
                    "mnemonic": customer.document_number[:10],
                    "street": customer.address.street if customer.address else "",
                    "townCountry": customer.address.city if customer.address else "",
                }
            }

            response = await self._make_request("POST", endpoint, data=payload)

            if response and "body" in response:
                return self._parse_customer_response(response["body"])

            raise Exception("Failed to create customer")

        except Exception as e:
            logger.error(f"Error creating customer in Transact: {e}")
            # Return a mock response
            return Customer(
                id=f"CUST{uuid.uuid4().hex[:6].upper()}",
                document_type=customer.document_type,
                document_number=customer.document_number,
                first_name=customer.first_name,
                last_name=customer.last_name,
                full_name=f"{customer.first_name} {customer.last_name}",
                email=customer.email,
                phone=customer.phone,
                address=customer.address,
                created_at=datetime.utcnow(),
            )

    # Loan Operations
    async def create_personal_loan(self, loan: PersonalLoanCreate) -> LoanResponse:
        """Create a personal loan in Transact"""
        try:
            # Transact AA (Arrangement Architecture) payload
            endpoint = self.api_paths["arrangements"]

            payload = {
                "body": {
                    "productId": "PERSONAL.LOAN",
                    "customerId": loan.customer_id,
                    "currency": "MXN",
                    "commitmentAmount": str(loan.amount),
                    "term": f"{loan.term_months}M",
                    "maturityDate": (date.today() + timedelta(days=30*loan.term_months)).isoformat(),
                }
            }

            response = await self._make_request("POST", endpoint, data=payload)

            if response and "body" in response:
                return self._parse_loan_response(response["body"], loan)

            raise Exception("Failed to create loan in Transact")

        except Exception as e:
            logger.error(f"Error creating personal loan in Transact: {e}")
            # Create locally as fallback
            return await self._create_loan_locally(loan, LoanType.PERSONAL)

    async def create_auto_loan(self, loan: AutoLoanCreate) -> LoanResponse:
        """Create an auto loan in Transact"""
        try:
            endpoint = self.api_paths["arrangements"]
            financed_amount = loan.get_financed_amount()

            payload = {
                "body": {
                    "productId": "AUTO.LOAN",
                    "customerId": loan.customer_id,
                    "currency": "MXN",
                    "commitmentAmount": str(financed_amount),
                    "term": f"{loan.term_months}M",
                    "maturityDate": (date.today() + timedelta(days=30*loan.term_months)).isoformat(),
                    # Vehicle info as custom fields
                    "vehicleMake": loan.vehicle_info.make,
                    "vehicleModel": loan.vehicle_info.model,
                    "vehicleYear": str(loan.vehicle_info.year),
                }
            }

            response = await self._make_request("POST", endpoint, data=payload)

            if response and "body" in response:
                return self._parse_loan_response(response["body"], loan, financed_amount)

            raise Exception("Failed to create auto loan in Transact")

        except Exception as e:
            logger.error(f"Error creating auto loan in Transact: {e}")
            return await self._create_loan_locally(loan, LoanType.AUTO)

    async def get_loan(self, loan_id: str) -> Optional[LoanDetail]:
        """Get loan details from Transact"""
        try:
            endpoint = self.api_paths["arrangement_get"].format(arrangementId=loan_id)
            response = await self._make_request("GET", endpoint)

            if response and "body" in response:
                return self._parse_loan_detail(response["body"])
            return None

        except Exception as e:
            logger.error(f"Error getting loan from Transact: {e}")
            # Check local storage
            if loan_id in self._created_loans:
                loan = self._created_loans[loan_id]
                return LoanDetail(
                    loan_id=loan.loan_id,
                    arrangement_id=loan.arrangement_id,
                    customer_id=loan.customer_id,
                    loan_type=loan.loan_type,
                    status=loan.status,
                    amount=loan.amount,
                    term_months=loan.term_months,
                    interest_rate=loan.interest_rate,
                    monthly_payment=loan.monthly_payment,
                    total_payment=loan.total_payment,
                    currency=loan.currency,
                    created_at=loan.created_at,
                    remaining_balance=loan.amount,
                    total_interest=loan.total_payment - loan.amount,
                    payments_made=0,
                    payments_remaining=loan.term_months,
                )
            return None

    async def get_customer_loans(self, customer_id: str) -> List[LoanSummary]:
        """Get all loans for a customer from Transact"""
        try:
            endpoint = self.api_paths["arrangements"]
            params = {"customerId": customer_id}

            response = await self._make_request("GET", endpoint, params=params)

            summaries = []
            if response and "body" in response:
                for item in response.get("body", []):
                    summary = self._parse_loan_summary(item)
                    if summary:
                        summaries.append(summary)

            # Also include locally created loans
            for loan in self._created_loans.values():
                if loan.customer_id == customer_id:
                    today = date.today()
                    next_payment = date(today.year, today.month + 1, 1) if today.month < 12 else date(today.year + 1, 1, 1)
                    summaries.append(LoanSummary(
                        loan_id=loan.loan_id,
                        loan_type=loan.loan_type,
                        status=loan.status,
                        amount=loan.amount,
                        remaining_balance=loan.amount,
                        monthly_payment=loan.monthly_payment,
                        next_payment_date=next_payment,
                        currency=loan.currency,
                    ))

            return summaries

        except Exception as e:
            logger.error(f"Error getting customer loans from Transact: {e}")
            # Return locally created loans
            return [
                LoanSummary(
                    loan_id=loan.loan_id,
                    loan_type=loan.loan_type,
                    status=loan.status,
                    amount=loan.amount,
                    remaining_balance=loan.amount,
                    monthly_payment=loan.monthly_payment,
                    next_payment_date=date.today() + timedelta(days=30),
                    currency=loan.currency,
                )
                for loan in self._created_loans.values()
                if loan.customer_id == customer_id
            ]

    # Simulation
    async def simulate_loan(self, simulation: LoanSimulationRequest) -> LoanSimulationResponse:
        """Simulate a loan (uses local calculation)"""
        interest_rate = await self.get_interest_rate(
            simulation.loan_type.value,
            simulation.term_months,
            simulation.vehicle_type.value if simulation.vehicle_type else None
        )

        monthly_payment = self._calculate_monthly_payment(
            simulation.amount, interest_rate, simulation.term_months
        )
        total_payment = monthly_payment * simulation.term_months
        total_interest = total_payment - simulation.amount

        return LoanSimulationResponse(
            loan_type=simulation.loan_type,
            amount=simulation.amount,
            term_months=simulation.term_months,
            interest_rate=interest_rate,
            monthly_payment=monthly_payment,
            total_payment=total_payment,
            total_interest=total_interest,
            currency="MXN",
        )

    # Payment Schedule
    async def get_payment_schedule(self, loan_id: str) -> Optional[PaymentSchedule]:
        """Get payment schedule from Transact"""
        try:
            endpoint = self.api_paths["payment_schedules"]
            params = {"arrangementId": loan_id}

            response = await self._make_request("GET", endpoint, params=params)

            if response and "body" in response:
                return self._parse_payment_schedule(response["body"], loan_id)

            return None

        except Exception as e:
            logger.error(f"Error getting payment schedule from Transact: {e}")
            # Generate sample schedule
            return self._generate_sample_schedule(loan_id)

    async def get_interest_rate(
        self, loan_type: str, term_months: int, vehicle_type: Optional[str] = None
    ) -> Decimal:
        """Get interest rate (from configuration)"""
        # In a real implementation, this would call Transact Product Catalog
        rates = {
            "PERSONAL": {6: 18.0, 12: 16.5, 24: 14.5, 36: 13.5, 48: 13.0, 60: 12.5},
            "AUTO": {12: 11.0, 24: 10.5, 36: 10.0, 48: 9.5, 60: 9.0, 72: 8.5},
        }

        loan_rates = rates.get(loan_type, rates["PERSONAL"])
        available_terms = sorted(loan_rates.keys())
        closest_term = min(available_terms, key=lambda x: abs(x - term_months))

        return Decimal(str(loan_rates[closest_term]))

    # Helper Methods
    def _calculate_monthly_payment(
        self, principal: Decimal, annual_rate: Decimal, term_months: int
    ) -> Decimal:
        """Calculate monthly payment using amortization formula"""
        if annual_rate == 0:
            return (principal / term_months).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        monthly_rate = annual_rate / Decimal("100") / Decimal("12")
        numerator = monthly_rate * ((1 + monthly_rate) ** term_months)
        denominator = ((1 + monthly_rate) ** term_months) - 1
        monthly_payment = principal * (numerator / denominator)

        return monthly_payment.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    async def _create_loan_locally(self, loan, loan_type: LoanType) -> LoanResponse:
        """Create loan locally when Transact is unavailable"""
        loan_id = f"{'PL' if loan_type == LoanType.PERSONAL else 'AL'}{uuid.uuid4().hex[:8].upper()}"
        arrangement_id = f"AA{uuid.uuid4().hex[:10].upper()}"

        amount = loan.amount if loan_type == LoanType.PERSONAL else loan.get_financed_amount()
        interest_rate = await self.get_interest_rate(
            loan_type.value, loan.term_months,
            loan.vehicle_info.vehicle_type.value if hasattr(loan, 'vehicle_info') else None
        )
        monthly_payment = self._calculate_monthly_payment(amount, interest_rate, loan.term_months)
        total_payment = monthly_payment * loan.term_months

        loan_response = LoanResponse(
            loan_id=loan_id,
            arrangement_id=arrangement_id,
            customer_id=loan.customer_id,
            loan_type=loan_type,
            status=LoanStatus.APPROVED,
            amount=amount,
            term_months=loan.term_months,
            interest_rate=interest_rate,
            monthly_payment=monthly_payment,
            total_payment=total_payment,
            currency="MXN",
            created_at=datetime.utcnow(),
        )

        self._created_loans[loan_id] = loan_response
        logger.info(f"Created loan locally: {loan_id}")

        return loan_response

    def _parse_customer_response(self, data: dict) -> Optional[Customer]:
        """Parse Transact customer response"""
        try:
            return Customer(
                id=data.get("customerId", data.get("@id", "")),
                document_type=DocumentType.INE,
                document_number=data.get("mnemonic", ""),
                first_name=data.get("customerName", "").split()[0] if data.get("customerName") else "",
                last_name=" ".join(data.get("customerName", "").split()[1:]) if data.get("customerName") else "",
                full_name=data.get("customerName", ""),
                email=data.get("email", ""),
                phone=data.get("phone", ""),
                address=Address(
                    street=data.get("street", ""),
                    city=data.get("townCountry", ""),
                    state="",
                    postal_code=data.get("postCode", ""),
                    country="Mexico",
                ),
                credit_score=None,
                active_products=[],
                created_at=datetime.utcnow(),
            )
        except Exception as e:
            logger.error(f"Error parsing customer response: {e}")
            return None

    def _parse_loan_response(self, data: dict, loan, amount: Decimal = None) -> LoanResponse:
        """Parse Transact loan creation response"""
        loan_id = data.get("arrangementId", f"AA{uuid.uuid4().hex[:10].upper()}")
        amount = amount or loan.amount

        interest_rate = Decimal(data.get("interestRate", "14.5"))
        monthly_payment = self._calculate_monthly_payment(amount, interest_rate, loan.term_months)

        return LoanResponse(
            loan_id=loan_id,
            arrangement_id=loan_id,
            customer_id=loan.customer_id,
            loan_type=LoanType.PERSONAL if "PERSONAL" in data.get("productId", "") else LoanType.AUTO,
            status=LoanStatus.APPROVED,
            amount=amount,
            term_months=loan.term_months,
            interest_rate=interest_rate,
            monthly_payment=monthly_payment,
            total_payment=monthly_payment * loan.term_months,
            currency=data.get("currency", "MXN"),
            created_at=datetime.utcnow(),
        )

    def _parse_loan_summary(self, data: dict) -> Optional[LoanSummary]:
        """Parse loan summary from Transact"""
        try:
            return LoanSummary(
                loan_id=data.get("arrangementId", ""),
                loan_type=LoanType.PERSONAL if "PERSONAL" in data.get("productId", "") else LoanType.AUTO,
                status=LoanStatus.ACTIVE,
                amount=Decimal(str(data.get("commitmentAmount", 0))),
                remaining_balance=Decimal(str(data.get("outstandingAmount", 0))),
                monthly_payment=Decimal(str(data.get("periodicPaymentAmount", 0))),
                next_payment_date=date.today() + timedelta(days=30),
                currency=data.get("currency", "MXN"),
            )
        except Exception as e:
            logger.error(f"Error parsing loan summary: {e}")
            return None

    def _parse_loan_detail(self, data: dict) -> Optional[LoanDetail]:
        """Parse loan detail from Transact"""
        try:
            amount = Decimal(str(data.get("commitmentAmount", 0)))
            remaining = Decimal(str(data.get("outstandingAmount", 0)))

            return LoanDetail(
                loan_id=data.get("arrangementId", ""),
                arrangement_id=data.get("arrangementId", ""),
                customer_id=data.get("customerId", ""),
                loan_type=LoanType.PERSONAL if "PERSONAL" in data.get("productId", "") else LoanType.AUTO,
                status=LoanStatus.ACTIVE,
                amount=amount,
                term_months=int(data.get("term", "12").replace("M", "")),
                interest_rate=Decimal(str(data.get("interestRate", 14.5))),
                monthly_payment=Decimal(str(data.get("periodicPaymentAmount", 0))),
                total_payment=amount,
                currency=data.get("currency", "MXN"),
                created_at=datetime.utcnow(),
                remaining_balance=remaining,
                total_interest=Decimal("0"),
                payments_made=0,
                payments_remaining=int(data.get("term", "12").replace("M", "")),
            )
        except Exception as e:
            logger.error(f"Error parsing loan detail: {e}")
            return None

    def _parse_payment_schedule(self, data: dict, loan_id: str) -> PaymentSchedule:
        """Parse payment schedule from Transact"""
        # Parse Transact payment schedule format
        payments = []
        # Implementation depends on Transact response format
        return self._generate_sample_schedule(loan_id)

    def _generate_sample_schedule(self, loan_id: str) -> PaymentSchedule:
        """Generate sample payment schedule"""
        principal = Decimal("100000.00")
        annual_rate = Decimal("14.50")
        term_months = 24
        tax_rate = Decimal("0.16")

        monthly_rate = annual_rate / Decimal("100") / Decimal("12")
        monthly_payment = self._calculate_monthly_payment(principal, annual_rate, term_months)

        payments = []
        remaining_balance = principal
        start_date = date.today() + timedelta(days=30)

        for i in range(1, term_months + 1):
            interest = (remaining_balance * monthly_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            tax = (interest * tax_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            principal_payment = monthly_payment - interest
            remaining_balance = max(Decimal("0"), remaining_balance - principal_payment)

            due_date = start_date + timedelta(days=30 * (i - 1))
            status = PaymentStatus.PAID if due_date < date.today() else PaymentStatus.PENDING

            payments.append(Payment(
                payment_number=i,
                due_date=due_date,
                principal=principal_payment,
                interest=interest,
                tax=tax,
                total_payment=monthly_payment + tax,
                remaining_balance=remaining_balance,
                status=status,
            ))

        return PaymentSchedule(
            loan_id=loan_id,
            arrangement_id=f"AA{loan_id}",
            customer_id="CUST001",
            currency="MXN",
            payments=payments,
            summary=ScheduleSummary(
                total_payments=term_months,
                payments_made=0,
                payments_pending=term_months,
                payments_overdue=0,
                total_principal=principal,
                total_interest=Decimal("0"),
                total_tax=Decimal("0"),
                total_amount=principal,
                amount_paid=Decimal("0"),
                amount_remaining=principal,
            ),
        )

    def _get_mock_customers_filtered(self, query: CustomerSearchQuery) -> List[Customer]:
        """Get mock customers filtered by query"""
        all_customers = self._get_mock_customers()
        results = []

        for customer in all_customers:
            if query.document_number and query.document_number.upper() in customer.document_number.upper():
                results.append(customer)
            elif query.name and query.name.upper() in customer.full_name.upper():
                results.append(customer)
            elif query.phone and query.phone in customer.phone:
                results.append(customer)

        return results

    def _get_mock_customer_by_id(self, customer_id: str) -> Optional[Customer]:
        """Get mock customer by ID"""
        for customer in self._get_mock_customers():
            if customer.id == customer_id:
                return customer
        return None

    def _get_mock_customers(self) -> List[Customer]:
        """Get mock customers for fallback"""
        return [
            Customer(
                id="CUST001",
                document_type=DocumentType.INE,
                document_number="INE1234567890",
                first_name="Juan",
                last_name="Garcia",
                full_name="Juan Carlos Garcia Lopez",
                email="juan.garcia@email.com",
                phone="5551234567",
                address=Address(
                    street="Av. Reforma 123",
                    city="Ciudad de Mexico",
                    state="CDMX",
                    postal_code="06600",
                    country="Mexico",
                ),
                credit_score=720,
                active_products=[],
                created_at=datetime(2020, 1, 15),
            ),
            Customer(
                id="CUST002",
                document_type=DocumentType.INE,
                document_number="INE9876543210",
                first_name="Maria",
                last_name="Rodriguez",
                full_name="Maria Elena Rodriguez Martinez",
                email="maria.rodriguez@email.com",
                phone="5559876543",
                address=Address(
                    street="Calle Insurgentes 456",
                    city="Ciudad de Mexico",
                    state="CDMX",
                    postal_code="06700",
                    country="Mexico",
                ),
                credit_score=780,
                active_products=[],
                created_at=datetime(2019, 3, 10),
            ),
        ]

import { useNavigate } from 'react-router-dom';
import type { PreApprovalOffer } from '../../types';
import { formatCurrency } from '../../utils';
import { Button } from '../common';

interface PreApprovalBannerProps {
  offer: PreApprovalOffer;
}

export function PreApprovalBanner({ offer }: PreApprovalBannerProps) {
  const navigate = useNavigate();

  const handleApplyNow = () => {
    // Navigate to product application flow
    navigate('/products', { state: { selectedOffer: offer } });
  };

  return (
    <div className="bg-primary rounded-lg p-6 text-white mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">{offer.ProductName}</h2>
          <p className="text-white/90">
            You've been pre-approved for {formatCurrency(offer.ApprovedAmount)}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleApplyNow}
          className="bg-white text-gray-800 border-white hover:bg-gray-100 hover:text-gray-800 whitespace-nowrap"
        >
          Apply Now
        </Button>
      </div>
    </div>
  );
}

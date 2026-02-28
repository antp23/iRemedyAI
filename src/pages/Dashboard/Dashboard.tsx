import { useProducts } from '@/hooks';
import {
  EagleIcon,
  FloatingPills,
  RotatingGlobe,
  GradientDivider,
} from '@/components/design-system';
import DashboardStats from './DashboardStats';
import ApiSourceChart from './ApiSourceChart';
import HighRiskAlerts from './HighRiskAlerts';

const Dashboard = () => {
  const { products, baaEligible, highRisk, averageMIA, productsByCountry } =
    useProducts();

  const hasProducts = products.length > 0;

  return (
    <div>
      {/* Hero Banner */}
      <section
        className="relative overflow-hidden bg-navy px-6 py-12 md:px-12 md:py-16"
        data-testid="hero-banner"
      >
        <FloatingPills
          count={8}
          className="pointer-events-none absolute inset-0 opacity-20"
        />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex items-center gap-3">
              <EagleIcon size={56} className="text-gold" />
              <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
                iRemedy AI
              </h1>
            </div>
            <p className="mt-4 max-w-lg text-lg text-white/70">
              {hasProducts
                ? `Tracking ${products.length.toLocaleString()} products across the American pharmaceutical supply chain`
                : 'No products tracked yet'}
            </p>
          </div>

          <RotatingGlobe size={160} className="shrink-0 opacity-60" />
        </div>
      </section>

      <GradientDivider />

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-12">
        {/* Stat Cards */}
        <DashboardStats
          products={products}
          baaEligible={baaEligible}
          highRisk={highRisk}
          averageMIA={averageMIA}
        />

        <GradientDivider className="my-8" />

        {/* Two-column grid: chart + alerts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ApiSourceChart productsByCountry={productsByCountry} />
          <HighRiskAlerts products={products} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

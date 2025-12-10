import { useNavigate } from 'react-router-dom';

const Hero = ({ 
  title = "About us", 
  breadcrumbs = ["Home", "About Us"],
  backgroundImage = "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80",
  overlayOpacity = "bg-black/50",
  blur = "backdrop-blur-sm"
}) => {
  const navigate = useNavigate();

  const handleBreadcrumbClick = (crumb, index) => {
    if (index < breadcrumbs.length - 1) {
      switch(crumb) {
        case 'Home':
          navigate('/');
          break;
        case 'Pages':
          navigate('/pages');
          break;
        case 'About Us':
          navigate('/about');
          break;
        case 'Services':
          navigate('/services');
          break;
        case 'Contact':
          navigate('/contact');
          break;
        case 'Blog':
          navigate('/blog');
          break;
        default:
          const route = `/${crumb.toLowerCase().replace(/\s+/g, '-')}`;
          navigate(route);
      }
    }
  };

  return (
    <div 
      className="relative overflow-hidden py-32 sm:py-40 px-4 sm:px-6 lg:px-8" // increased py for more height
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '600px', // optional: ensures a minimum height
      }}
    >
      {/* Overlay with blur */}
      <div className={`absolute inset-0 ${overlayOpacity} ${blur}`}></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-200 mb-6">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <button
                onClick={() => handleBreadcrumbClick(crumb, index)}
                className={`
                  ${index === breadcrumbs.length - 1 
                    ? 'text-white font-medium cursor-default' 
                    : 'hover:text-white transition-colors text-gray-200 hover:scale-105 transform'
                  }
                  focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50 rounded
                `}
                disabled={index === breadcrumbs.length - 1}
                aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
              >
                {crumb}
              </button>
              {index < breadcrumbs.length - 1 && (
                <span className="text-gray-400">/</span>
              )}
            </div>
          ))}
        </div>
        
        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center">
          {title}
        </h1>
      </div>
    </div>
  );
};

export default Hero;

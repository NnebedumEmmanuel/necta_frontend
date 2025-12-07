import './App.css'
import HeroSlider from './components/home/Hero'
import Footer from './components/layout/footer'
import DiscountPage from './components/home/Discount'
import CategoryTab from './components/home/CategoryTab'
import ProductTabs from './components/home/home-products/ProductTab'
import BigSummerSale from './components/home/SummerSale'
import Header from './components/layout/Header'
import ScrollToTopButton from './components/shared/ScrollToTop'
import Marquee from './components/home/Advert'

function App() {

  return (
    <>
    <Header/>
   <HeroSlider/>
   <CategoryTab/>
   <ProductTabs/>
   <DiscountPage/>
   <BigSummerSale/>
   <Marquee/>
   <ScrollToTopButton/>
   <Footer/>
   
    </>
  )
}

export default App

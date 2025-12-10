import React from "react";
import HeroSlider from "../../components/home/Hero";
import CategoryTab from "../../components/home/CategoryTab";
import ProductTabs from "../../components/home/home-products/ProductTab";
import DiscountPage from "../../components/home/Discount";
import BigSummerSale from "../../components/home/SummerSale";
import SpeakerMarquee from "../../components/home/Marquee";
import ScrollToTopButton from "../../components/shared/ScrollToTop";
import BrowseByCategory from "../../components/home/BroseByCategory";

function HomePage() {
  return (
    <>
      <HeroSlider />
      <CategoryTab />
      <ProductTabs />
      <BrowseByCategory/>
      <DiscountPage />
      <BigSummerSale />
      <SpeakerMarquee />
    </>
  );
}

export default HomePage;
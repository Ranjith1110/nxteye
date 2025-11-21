import Hero from '../components/home/Hero'
import Navbar from '../components/home/Navbar'
import WearTheTrend from '../components/home/WearTheTrend'
import NewArrivals from '../components/home/NewArrivals'
import LimitedTimeOffers from '../components/home/LimitedTimeOffers'
import WhyNxTEye from '../components/home/WhyNxTEye'
import OurBrands from '../components/home/OurBrands'
import CustomerReviews from '../components/home/CustomerReviews'
import Footer from '../components/home/Footer'

const Home = () => {
  return (
    <>
        <Navbar />
        <Hero />
        <WearTheTrend />
        <LimitedTimeOffers />
        <NewArrivals />
        <WhyNxTEye />
        <OurBrands />
        <CustomerReviews />
        <Footer />
    </>
  )
}

export default Home
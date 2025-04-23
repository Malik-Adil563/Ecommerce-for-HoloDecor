import { Navbar, Main, Footer, CategoryCards, ImgWDesc,SmallSection } from "../components";
import VideoShowcase from "../components/VideoShowcase";



function Home() {
  return (
    <>
      <Navbar />
      <Main />
      <CategoryCards />
      <ImgWDesc/>
      <SmallSection/>
      <VideoShowcase/>
      <Footer />
      
    </>
  )
}

export default Home
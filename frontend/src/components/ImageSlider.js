import { Carousel } from "@material-tailwind/react";
import image1 from "../images/Hostel/H1.jpg";
import image2 from "../images/Hostel/H2.jpg";
import image3 from "../images/Hostel/H3.jpg";

export default function Slider() {
  return (
    <div className="pt-3 mx-auto max-w-screen-2xl">
      <Carousel loop={true} autoplay={true} className="rounded-xl slider">
        <img
          src={image1}
          alt="image 1"
          className="h-full w-full object-cover object-center"
        />
        <img
          src={image2}
          alt="image 2"
          className="h-full w-full object-cover object-center"
        />
        <img
          src={image3}
          alt="image 3"
          className="h-full w-full object-cover object-center"
        />
      </Carousel>
      <style jsx>{`
        @media (min-width: 768px) {
          .slider {
            height: 400px; /* Set the desired height for desktop */
          }
        }
      `}</style>
    </div>
  );
}

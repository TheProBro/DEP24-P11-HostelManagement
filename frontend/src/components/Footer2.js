import { Typography } from "@material-tailwind/react";
 
export default function FooterWithLogo() {
  return (
    <footer className="w-full p-8 bg-color">
      <div className="flex flex-row flex-wrap items-center justify-center gap-y-6 gap-x-12 bg-color text-center md:justify-between md:mx-20">
        <span className="text-white text-left">
            <div className="text-lg font-semibold">
            Chief Warden
            </div>
            <div>
                IIT Ropar
            </div>
        
        </span>
        
        <ul className="flex flex-wrap items-center gap-y-2 gap-x-8">
        <li>
          <Typography
            as="a"
            href="https://www.iitrpr.ac.in/"
            target="_blank"
            color="white"
            className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
          >
            IIT Ropar Website
          </Typography>
        </li>
          <li>
            <Typography
              as="a"
              href="/about"
              color="white"
              className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
            >
              About Us
            </Typography>
          </li>
          <li>
            <Typography
              as="a"
              href="/contact"
              color="white"
              className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
            >
              Contact Us
            </Typography>
          </li>
        </ul>
      </div>
      <hr className="my-8 border-white" />
      <Typography color="white" className="text-center font-normal -my-4">
        IIT Ropar
      </Typography>
    </footer>
  );
}
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState, useMemo} from "react";
import { Link } from "react-router-dom";
import "../../styles/tailwind.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import {
  Spinner,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Button,
  CardBody,
  CardFooter,
  Radio,
  IconButton,
  Typography,
} from "@material-tailwind/react";

import ListView from "./HostelView/ListView"

function Card({ children }) {
  return <div className=" rounded-md py-2">{children}</div>;
}

function CardHeader({ children }) {
  return <div className="">{children}</div>;
}

function CardTitle({ children }) {
  return <p className="text-sm font-bold">{children}</p>;
}

function GroupIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7V5c0-1.1.9-2 2-2h2" />
      <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
      <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
      <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
      <rect width="7" height="5" x="7" y="7" rx="1" />
      <rect width="7" height="5" x="10" y="12" rx="1" />
    </svg>
  );
}

const TABLE_HEAD = ["Entry No.", "Name", "Batch", "Room No", "Contact No.","Email"];

function HostelRoomCard({
  room_no,
  students,
  room_current_occupancy,
  room_occupancy,
}) {
  // const navigate= useNavigate();
  function handleClick() {
    // console.log("Room number here:", room_no);
    // navigate(`/room-details/${parseInt(room_no)}`);
    // navigate('')
  }
  const backgroundColorClass =
    room_current_occupancy === room_occupancy ? "bg-gray-300" : "bg-green-200";
  const backgroundColorClass2 =
    room_current_occupancy === room_occupancy
      ? "hover:bg-gray-400"
      : "hover:bg-green-300";
  return (
    <Link
      to={`../room-details/${room_no}`}
      className="no-underline text-black py-1"
    >
      <div
        className={`${backgroundColorClass} border-none rounded-md flex items-center justify-center mr-1 border border-black hover:cursor-pointer ${backgroundColorClass2} max-w-screen-2xl`}
      >
        <Card className="px-12">
          <CardHeader className="">
            <p className="text-sm font-semibold text-center">{room_no}</p>
          </CardHeader>
          <CardFooter className="py-0.5 px-auto">
            <div className="flex items-center space-x-1 p-0 py-0 px-auto">
              <GroupIcon className="h-3 w-3 text-gray-700" />
              <p className="text-sm text-gray-700 ">
                {room_current_occupancy}
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Link>
  );
}

export default function HostelRooms() {
  const { hostel } = useParams();
  const { currentUser, loading } = useAuth();
  const [hostelDetails, setHostelDetails] = useState({});
  const [spin, setSpin] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [selectedOption, setSelectedOption] = useState("box");
  const [search, setSearch] = useState("");
  // console.log(hostel);
  const backendUrl = process.env.REACT_APP_BASE_URL;
  useEffect(() => {
    setSpin(true);
    axios
      .get(`${backendUrl}/api/get_hostel/${hostel}`, { withCredentials: true })
      .then((response) => {
        // console.log("here");
        // console.log("here", response.data);
        setRooms(response.data.data);
        console.log(response.data.data);
        setHostelDetails(response.data.hostel);
        setSpin(false);
        // setHostelName(response.data.data.hostel_name);
        // handle the response data
      });
    // axios
    //   .get(`${backendUrl}/api/get_hostel_rooms/${currentUser.hostel}`, {
    //     withCredentials: true,
    //   })
    //   .then((response) => {
    //     // handle the response data
    //     console.log(response.data);
    //     setRooms(response.data.data);
    //   })
    //   .catch((error) => {
    //     // handle the error
    //   });
  }, []);

  const handleInputChange = (e) => {
    setSearch(e.target.value);
  };

  function HostelRoomDetails() {
    // console.log("hello");
    const [active, setActive] = React.useState(1);

    if (!Array.isArray(rooms) || rooms.length === 0) {
      console.log("No rooms data available");
      return; // or handle this case appropriately
    }

    // Extract the first digit of the room number as the floor number
    const floorNumbers = rooms
      .filter((room) => !room.is_for_guests) // Ensure room_no is defined and is a string
      .map((room) => parseInt(room.room_no.match(/\d+$/)?.[0] || 0)); // Use optional chaining and fallback to handle cases where room_no might not match the expected format

    if (floorNumbers.length === 0) {
      console.log("No valid room numbers found");
      return; // or handle this case appropriately
    }

    // console.log(floorNumbers, "floorNumbers");

    // Find the maximum floor number
    const maxFloorNumber = Math.max(...floorNumbers) / 100;
    // console.log(maxFloorNumber, "maxFloorNumber");
    const paginationNumbers = Array.from(
      { length: maxFloorNumber },
      (_, i) => i + 1
    );

    // console.log(maxFloorNumber, "maxFloorNumber");
    // console.log(paginationNumbers, "paginationNumbers");

    const filteredRooms = rooms.filter((room) => {
      const floorNumber = parseInt(room.room_no.match(/\d+$/)[0]);
      // console.log("filtered", floorNumber.toString()[0] - "0", active);
      return floorNumber.toString()[0] - "0" === active && !room.is_for_guests;
    });

    const getItemProps = (index) => ({
      variant: active === index ? "filled" : "text",
      color: "gray",
      onClick: () => setActive(index),
    });

    return (
      <div className="bg-gray-200 p-4 overflow-x-auto rounded-md">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex gap-2">
            <span className="font-semibold text-lg my-auto">Select Floor</span>
            {paginationNumbers.map((number) => (
              <IconButton key={number} {...getItemProps(number)}>
                {number}
              </IconButton>
            ))}
          </div>
        </div>
        <div className="flex flex-row item-center space-x-1">
          <div className="flex flex-wrap">
            {filteredRooms.map((room, index) => (
              <div key={index} className="w-20 px-0 my-1">
                <HostelRoomCard {...room} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  function InternRoomDetails() {
    // console.log("hello");
    const [active, setActive] = React.useState(1);

    if (!Array.isArray(rooms) || rooms.length === 0) {
      console.log("No rooms data available");
      return; // or handle this case appropriately
    }

    // Extract the first digit of the room number as the floor number
    const floorNumbers = rooms
      .filter((room) => room.is_for_guests) // Ensure room_no is defined and is a string
      .map((room) => parseInt(room.room_no.match(/\d+$/)?.[0] || 0)); // Use optional chaining and fallback to handle cases where room_no might not match the expected format

    if (floorNumbers.length === 0) {
      console.log("No valid room numbers found");
      return; // or handle this case appropriately
    }

    // console.log(floorNumbers, "floorNumbers");

    // Find the maximum floor number
    const maxFloorNumber = Math.max(...floorNumbers) / 100;
    // console.log(maxFloorNumber, "maxFloorNumber");
    const paginationNumbers = Array.from(
      { length: maxFloorNumber },
      (_, i) => i + 1
    );

    // console.log(maxFloorNumber, "maxFloorNumber");
    // console.log(paginationNumbers, "paginationNumbers");

    const filteredRooms = rooms.filter((room) => {
      const floorNumber = parseInt(room.room_no.match(/\d+$/)[0]);
      // console.log("filtered", floorNumber.toString()[0] - "0", active);
      // return floorNumber.toString()[0] - "0" === active && room.is_for_guests;
      return room.is_for_guests
    });

    const getItemProps = (index) => ({
      variant: active === index ? "filled" : "text",
      color: "gray",
      onClick: () => setActive(index),
    });

    return (
      <div className="bg-gray-200 p-4 overflow-x-auto rounded-md">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex gap-2">
            <span className="font-semibold text-lg my-auto">Select Floor</span>
            {paginationNumbers.map((number) => (
              <IconButton key={number} {...getItemProps(number)}>
                {number}
              </IconButton>
            ))}
          </div>
        </div>
        <div className="flex flex-row item-center space-x-1">
          <div className="flex flex-wrap">
            {filteredRooms.map((room, index) => (
              <div key={index} className="w-20 px-0 my-1">
                <HostelRoomCard {...room} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const data = [
    {
      label: "Institute Students",
      value: "institute students",
    },
    {
      label: "Interns",
      value: "interns",
    },
  ];

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return loading || spin ? (
    <Spinner />
  ) : (
    !loading && (
      <div className="container mx-auto px-8 m-4 w-screen-max overflow-x-hidden">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">
            {hostelDetails.hostel_name} Hostel Rooms
          </h1>
          <p className="text-gray-600 pb-0">
            Here are all the rooms in the hostel along with the number of
            students in each room.
          </p>
        </div>
        <div className="mt-4 mx-auto">
          <input type="radio" id="box" name="viewtype" value="box" className="ml-2" onChange={handleOptionChange} checked={selectedOption === 'box'} />
          <label htmlFor="box" className="pl-1 text-lg  mr-4">Box View</label>
          <input type="radio" id="list" name="viewtype" value="list"className="ml-2" onChange={handleOptionChange} checked={selectedOption === 'list'} />
          <label htmlFor="list" className="pl-1 text-lg mr-4">List View</label>
        </div>
        {selectedOption === 'box' ?
        <div>
          <Tabs id="custom-animation" value={data[0].value} className="">
            <TabsHeader className="w-full lg:w-96 mx-auto mt-4">
              {data.map(({ label, value }) => (
                <Tab key={value} value={value}>
                  {label}
                </Tab>
              ))}
            </TabsHeader>
            <div className="flex items-center space-x-8 mt-2 -mb-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-200 mr-2 border border-black"></div>
                <p className="">Vacant</p>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-300 mr-2 border border-black"></div>
                <p className="">Occupied</p>
              </div>
            </div>
            <TabsBody
              animate={{
                initial: { y: 250 },
                mount: { y: 0 },
                unmount: { y: 250 },
              }}
              
            >
              {data.map(({ value, desc }) => (
                <TabPanel key={value} value={value}>
                  <div className="bg-gray-200 p-4 overflow-x-auto rounded-md">
                    <div className="flex flex-row item-center space-x-1">
                      <div className="flex flex-wrap">
                        {value === "institute students" || !value ? (
                          <HostelRoomDetails />
                        ) : (
                          <InternRoomDetails />
                        )}
                      </div>
                    </div>
                  </div>
                </TabPanel>
              ))}
            </TabsBody>
          </Tabs>
        </div>
         :
         <div>

           {<ListView hostel={hostel} students={rooms}/>}
         </div>
        // :<></>
         }
      </div>
    )
  );
}

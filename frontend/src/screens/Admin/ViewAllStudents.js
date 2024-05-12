import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  Spinner,
  Typography,
  Button,
  CardBody,
  CardFooter,
  Select,
  Option,
} from "@material-tailwind/react";
// import { Check } from "@material-ui/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useComments } from "../../contexts/commentsContext";
const TABLE_HEAD = ["Entry No.", "Name", "Batch", "Room No", "Contact No.","Email"];
const backendUrl = process.env.REACT_APP_BASE_URL; // Define backendUrl

export default function ViewAllStudents() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const { comments, setComments, selectedOptions, setSelectedOptions } =
    useComments();
  const StudentsPerPage = 20;
  const [search, setSearch] = useState("");
  const [student, setStudent] = useState([]);
  const [Batch, setBatch] = useState([]);
  const [Hostel, setHostel] = useState([]);
  const [Gender, setGender] = useState([]);
  const [selectedHostels, setSelectedHostels] = useState([]);
  const [selectedGender, setSelectedGender] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [runner,setRunner] = useState(0);
  const [count,setCount] = useState(0);
  // Toggle Hostels
  const toggleHostel = (hostel) => {
    if (selectedHostels.includes(hostel)) {
      setSelectedHostels(selectedHostels.filter((h) => h !== hostel));
    } else {
      setSelectedHostels([...selectedHostels, hostel]);
    }
  };

  // Toggle Batch
  const toggleBatch = (batch) => {
    if (selectedBatch.includes(batch)) {
      setSelectedBatch(selectedBatch.filter((h) => h !== batch));
    } else {
      setSelectedBatch([...selectedBatch, batch]);
    }
  };

  // Toggle Batch
  const toggleGender = (batch) => {
    if (selectedGender.includes(batch)) {
      setSelectedGender(selectedGender.filter((h) => h !== batch));
    } else {
      setSelectedGender([...selectedGender, batch]);
    }
  };

  const removeAllFilters = () => {
    setSelectedHostels([]);
    setSelectedBatch([]);
    setSelectedGender([]);
  };

  const filterStudents = () => {
    var filteredStudentsvar = student;
    if (selectedHostels.length > 0) {
      filteredStudentsvar = filteredStudentsvar.filter((student) =>
        selectedHostels.includes(student.student_hostel_wing)
      );
    }
    if (selectedBatch.length > 0) {
      filteredStudentsvar = filteredStudentsvar.filter((student) =>
        selectedBatch.includes(student.student_batch)
      );
    }
    if (selectedGender.length > 0) {
      filteredStudentsvar = filteredStudentsvar.filter((student) =>
        selectedGender.includes(student.student_hostel_gender)
      );
    }
    console.log(search)
    if (search.length > 0) {
      filteredStudentsvar = filteredStudentsvar.filter((student) => {
        const studentName = student.student_name;
        console.log(student);
        if (studentName) {
          return studentName.toLowerCase().startsWith(search.toLowerCase())||student.student_roll.toLowerCase().startsWith(search.toLowerCase());
        }
        return false; // If studentName is undefined, filter it out
      });
    }
    const totalEntries = filteredStudentsvar.length
    console.log(totalEntries,"totalEntries")
    setCount(totalEntries,"hello123")
    setFilteredStudents(filteredStudentsvar);
  };

  useEffect(() => {
    filterStudents();
  }, [selectedHostels, selectedBatch, selectedGender,search]);

  // Calculate index of the last application on the current page
  const indexOfLastApplication = currentPage * StudentsPerPage;
  // Calculate index of the first application on the current page
  const indexOfFirstApplication = indexOfLastApplication - StudentsPerPage;
  // Get current Students to display

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const CurrentStudents = useMemo(() => {
    // setCount(filterStudents.length)
    // console.log(filterStudents, count, "hello")
    return filteredStudents.slice(
      indexOfFirstApplication,
      indexOfLastApplication
    );
  }, [filteredStudents, currentPage, runner]);

  // const totalPages = Math.ceil(totalStudents / StudentsPerPage);

  const totalStudents = useMemo(() => {
    if (filteredStudents.length === 0) setCurrentPage(0);
    else setCurrentPage(1);
    return filteredStudents.length;
  }, [filteredStudents,runner]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalStudents / StudentsPerPage);
  }, [totalStudents, StudentsPerPage]);



  useEffect(() => {
    axios
      .get(`${backendUrl}/api/get_students`, { withCredentials: true })
      .then((response) => {
        const temp = response.data.data;
        const totalEntries = temp.length;
        setCount(totalEntries)

        console.log("Total entries: " + totalEntries);
        temp.forEach(entry => {
            entry.selected = false;
        });
        // console.log(temp)
        const uniqueBatch = [
          ...new Set(temp.map((item) => item.student_batch)),
        ];
        const uniqueHostel = [
          ...new Set(temp.map((item) => item.student_hostel_wing)),
        ];
        const uniqueGender = [
          ...new Set(temp.map((item) => item.student_hostel_gender)),
        ];
        // const tempArr = [];
        setStudent(temp);

        setBatch(uniqueBatch);
        setHostel(uniqueHostel);
        setGender(uniqueGender);
        console.log(student)
        // filterStudents(temp);
        setFilteredStudents(temp);
        setRunner(1);
      })
      .catch((error) => {
        alert("Error fetching data:", error);
      });
  }, []);

  

  const navigate = useNavigate();

  const handleApplicationClick = (appId) => {
    navigate(`./application/${appId}`);
  };
  const setEvent = (e) => {
    if (e === "Approve Faculty") {
      return "Pending HOD Approval";
    } else if (e === "Approve HOD") {
      return "Pending Admin Approval";
    } else if (e === "Approve") {
      return "Pending Caretaker Action";
    } else {
      return "Rejected by Admin";
    }
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
  };

  const handleOption = (appId, e, currentStatus) => {
    // if(!isPlausible(setEvent(e), currentStatus)){}
    if (e === "Reject") {
      if (!comments[appId]) {
        alert("Please add comments for rejection");
        // setSelectedOptions({ ...selectedOptions, [appId]: {value: e} });
        navigate(`./application/${appId}`);
      } else {
        setSelectedOptions({
          ...selectedOptions,
          [appId]: { value: e, comments: comments[appId] },
        });
      }
    } else if (e === "Approve") {
      // setShowPopup(true);
      // console.log(appId);
    } else {
      setSelectedOptions({ ...selectedOptions, [appId]: { value: e } });
    }
    // console.log(selectedOptions);
  };

  if (student.length === 0) {
    return <Spinner size="large" className="mx-auto mt-16"/>;
  }

  const handleSubmit = () => {
    axios
      .get(`${backendUrl}/api/get_students`, { withCredentials: true })
      .then((response) => {});
  };

  return (
    <div className="flex justify-center h-full mt-4 ">
      <Card className=" w-screen-max h-full w-full lg:w-4/5">
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none mr-10 -mb-8"
        >
          <div className=" flex items-center justify-between gap-8">
            <div>
              <Typography variant="h5" color="blue-gray">
                Students
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                See information about all college students
              </Typography>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-max pt-3 z-0" value="All">
              <span className="my-auto mr-4">Apply Filter by:</span> <a onClick={removeAllFilters} className="text-blue-700 underline cursor-pointer"> clear filters</a>
              <div className="mt-4"><span>
                <Menu
                  dismiss={{
                    itemPress: false,
                  }}
                >
                  <MenuHandler>
                    <Button className={`px-6 py-2.5 mx-2 ${selectedBatch.length>0?'bg-green-400':'bg-gray-300 text-gray-900'} ${selectedBatch.length>0?'hover:bg-green-500':'hover:bg-gray-400'}`}>
                      Batch
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-72">
                    {Batch.map((item) => {
                      return (
                        <options>
                          <label
                            htmlFor={item}
                            className="flex cursor-pointer items-center gap-2 p-2"
                          >
                            <input type="checkbox" className="" id={item} checked={selectedBatch.includes(item)} onClick={() => toggleBatch(item)}/>
                            <span className="text-base">{item}</span>
                          </label>
                        </options>
                      );
                    })}
                  </MenuList>
                </Menu>
              </span>
              <span>
                <Menu
                  dismiss={{
                    itemPress: false,
                  }}
                >
                  <MenuHandler>
                  <Button className={`px-6 py-2.5 mx-2 ${selectedGender.length>0?'bg-green-400':'bg-gray-300 text-gray-900'} ${selectedGender.length>0?'hover:bg-green-500':'hover:bg-gray-400'}`}>
                      Gender
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-72">
                    {Gender.map((item) => {
                      return (
                        <options>
                          <label
                            htmlFor={item}
                            className="flex cursor-pointer items-center gap-2 p-2"
                            
                          >
                            <input type="checkbox" className="" id={item} checked={selectedGender.includes(item)} onClick={() => toggleGender(item)}/>
                            <span className="text-base">{item}</span>
                          </label>
                        </options>
                      );
                    })}
                  </MenuList>
                </Menu>
              </span>
              <span>
                <Menu
                  dismiss={{
                    itemPress: false,
                  }}
                >
                  <MenuHandler>
                  <Button className={`px-6 py-2.5 mx-2 cursor-text ${selectedHostels.length>0?'bg-green-400':'bg-gray-300 text-gray-900'} ${selectedHostels.length>0?'hover:bg-green-500':'hover:bg-gray-400'} `}>
                      Hostel
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-72">
                    {Hostel.map((item) => {
                      return (
                        <options>
                          <label
                            htmlFor={item}
                            className="flex cursor-pointer items-center gap-2 p-2"
                            
                          >
                            <input type="checkbox" className="" id={item} checked={selectedHostels.includes(item)} onClick={() => toggleHostel(item)}/>
                            <span className="text-base">{(item || (!item && "Unallocated"))}</span>
                          </label>
                        </options>
                      );
                    })}
                  </MenuList>
                </Menu>
              </span>
              </div>
            </div>
            <div>
                <span className="border-gray-500 py-2 px-2 border-2 rounded-xl">count = {count}</span>
            </div>
            <div className="w-full md:w-max flex flex-row border border-blue-gray-300 rounded focus:border-gray-800">
              <input
                placeholder="Search"
                onChange={handleInputChange}
                className="w-full md:w-max border-none focus:outline-none px-3 py-2"
              />
            <MagnifyingGlassIcon className="h-5 w-5 my-auto mr-2" />
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-0 mt-4 w-full overflow-x-auto">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-blue-gray-100 bg-blue-gray-50/50 p-4"
                  >
                    <Typography
                      variant="small"
                      color="black"
                      className="font-normal"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CurrentStudents.map(
                ({
                  student_roll,
                  student_name,
                  student_batch,
                  student_room,
                  student_phone,
                  student_email,
                }) => {
                  // const [id, setId]=useState(null);
                  const handleApprove = () => {
                    setShowPopup(student_roll);
                  };
                  return (
                    <tr
                      key={student_roll}
                      className="hover:bg-gray-200 hover:cursor-pointer border"
                    >
                      <td className="px-4 py-3 border-b border-blue-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              className="text-blue-gray-500 font-normal"
                            >
                              {student_roll}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-blue-gray-50">
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {student_name}
                          </Typography>
                          
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-blue-gray-50">
                        <div className="flex flex-col">
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal opacity-70"
                          >
                            {student_batch}
                          </Typography>
                          
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-blue-gray-50">
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {student_room}
                          </Typography>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-blue-gray-50">
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {student_phone}
                          </Typography>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-blue-gray-50">
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {student_email}
                          </Typography>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </CardBody>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Typography variant="small" color="blue-gray" className="font-normal">
            Page {currentPage} of {totalPages}
          </Typography>
          {/* <Button
            variant="outlined"
            size="sm"
            className="bg-color text-white hover:bg-blue-800"
            onClick={handleSubmit}
          >
            Submit
          </Button> */}
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Button
                variant="outlined"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
            )}
            {currentPage < totalPages && (
              <Button
                variant="outlined"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

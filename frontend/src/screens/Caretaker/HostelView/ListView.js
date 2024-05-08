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
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../contexts/authContext";
const TABLE_HEAD = ["Room No", "Entry No.", "Name", "Batch", "Contact No.","Email" ,""];
const backendUrl = process.env.REACT_APP_BASE_URL; // Define backendUrl

export default function ListView({hostel}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const StudentsPerPage = 20;
  const [search, setSearch] = useState("");
  const [student, setStudent] = useState([]);
  const [Batch, setBatch] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [runner,setRunner] = useState(0);

  // Toggle Batch
  const toggleBatch = (batch) => {
    if (selectedBatch.includes(batch)) {
      setSelectedBatch(selectedBatch.filter((h) => h !== batch));
    } else {
      setSelectedBatch([...selectedBatch, batch]);
    }
  };

  const removeAllFilters = () => {
    setSelectedBatch([]);
  };

  const filterStudents = () => {
    var filteredStudents = student;
    if (selectedBatch.length > 0) {
      filteredStudents = filteredStudents.filter((student) =>
        selectedBatch.includes(student.student_batch)
      );
    }
    console.log(search)
    if (search.length > 0) {
      filteredStudents = filteredStudents.filter((student) => {
        const studentName = student.student_name;
        console.log(student);
        if (studentName) {
          return studentName.toLowerCase().startsWith(search.toLowerCase());
        }
        return false; // If studentName is undefined, filter it out
      });
    }

    console.log(filteredStudents);
    setFilteredStudents(filteredStudents);
  };

  useEffect(() => {
    filterStudents();
  }, [selectedBatch,search]);

  // Calculate index of the last application on the current page
  const indexOfLastApplication = currentPage * StudentsPerPage;
  // Calculate index of the first application on the current page
  const indexOfFirstApplication = indexOfLastApplication - StudentsPerPage;
  // Get current Students to display

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const CurrentStudents = useMemo(() => {
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
      .get(`${backendUrl}/api/get_student/${hostel}`, { withCredentials: true })
      .then((response) => {
        const temp = response.data.data;

        const uniqueBatch = [
          ...new Set(temp.map((item) => item.student_batch)),
        ];
        // const tempArr = [];
        setStudent(temp);

        setBatch(uniqueBatch);
        console.log(student)
        console.log("hklasdhfjla")
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

  if (student.length === 0) {
    return <Spinner size="large" className="mx-auto mt-16"/>;
  }

  const handleSubmit = () => {
    axios
      .get(`${backendUrl}/api/get_students`, { withCredentials: true })
      .then((response) => {});
  };

  return (
    <div className="flex h-full mt-4 w-screen overflow-x-auto">
      <Card className=" w-screen-max h-full w-full lg:w-4/5">
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none mr-10 -mb-8"
        >
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
              </div>
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
              {
              CurrentStudents.sort((a, b) => {
                // Assuming student_room is a string, you can use localeCompare for string comparison
                return a.student_room.localeCompare(b.student_room);
              }).map(
                ({
                  student_room,
                  student_roll,
                  student_name,
                  student_batch,
                  student_phone,
                  student_email,
                },index) => {
                  // const [id, setId]=useState(null);
                  const handleApprove = () => {
                    setShowPopup(student_roll);
                  };
                  const rowColor = index % 2 != 0 ? 'bg-gray-50' : '';
                  return (
                    <tr
                      key={student_roll}
                      className={`hover:bg-gray-200 hover:cursor-pointer border ${rowColor}`}
                    >
                      <td className="px-4 py-3 border-b">
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
                      <td className="px-4 py-3 border-b">
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
                      <td className="px-4 py-3 border-b">
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
                      <td className="px-4 py-3 border-b border-blue-gray-50 ">
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
                      <td
                        className="p-4 border-b border-blue-gray-50 w-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Select variant="static" size="lg" direction="down"
                        //   label={
                        //     selectedOptions[application_id]?.value || "Select"
                        //   }
                        //   onChange={(e) => handleOption(application_id, e, status)}
                        >
                          <Option value="Approve" onClick={handleApprove}>
                            Approve
                          </Option>
                          <Option value="Approve Faculty">
                            Approve Faculty
                          </Option>
                          <Option value="Approve HOD">Approve HOD</Option>
                          <Option value="Reject">Reject</Option>
                        </Select>
                        {/* <ModalComponent
                        //   showPopup={showPopup === application_id}
                        //   application_id={application_id}
                        //   setShowPopup={setShowPopup}
                        //   selectedOptions={selectedOptions}
                        //   setSelectedOptions={setSelectedOptions}
                        //   gender={gender}
                        /> */}
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
          <Button
            variant="outlined"
            size="sm"
            className="bg-color text-white hover:bg-blue-800"
            onClick={handleSubmit}
          >
            Submit
          </Button>
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

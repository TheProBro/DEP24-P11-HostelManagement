import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  Input,
  Select,
  Option,
  Menu,
  MenuHandler,
  MenuList,
  Spinner,
  Typography,
  Button,
  CardBody,
  CardFooter,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@material-tailwind/react";
// import { Check } from "@material-ui/icons";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../contexts/authContext";
const TABLE_HEAD = ["Room No", "Entry No.", "Name", "Batch", "Contact Info","Prev Room","Change Status"];
const backendUrl = process.env.REACT_APP_BASE_URL; // Define backendUrl


export default function ListView({hostel},rooms) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const StudentsPerPage = 20;
  const [search, setSearch] = useState("");
  const [student, setStudent] = useState([]);
  const [Batch, setBatch] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [runner,setRunner] = useState(0);
  // const [selectedOptions, setSelectedOptions] = useState({});
  const [currentStudent, setCurrentStudent] = useState("");
  const [roomNumber, setRoomNumber]=useState("")
  const [newBatch, setNewBatch]=useState("")
  const [swapStudents, setSwapStudents] = useState([]);
  const [open,setOpen] = useState(false);
  const [count,setCount]=useState(0)
  const [open2,setOpen2] = useState(false);
  // console.log(rooms,"hello ji")
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
        const room = student.student_room;
        console.log(student.student_room);
        return studentName.toLowerCase().startsWith(search.toLowerCase()) || room.toLowerCase().startsWith(search.toLowerCase()) || student.student_roll.startsWith(search);
        // return false; // If studentName is undefined, filter it out
      });
    }

    console.log(filteredStudents);
    const countTotal = filteredStudents.length
    setCount(countTotal)
    setFilteredStudents(filteredStudents);
  };

  useEffect(() => {
    filterStudents();
  }, [selectedBatch,search]);

  useEffect(()=>{
    console.log("hello")
    console.log(rooms);
  }, [rooms] );

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
        const countTemp = temp.length
        setCount(countTemp)
        setBatch(uniqueBatch);
        console.log(student)
        // console.log("hklasdhfjla")
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

  // Handle Options
  const handleRoomNumberChange = (e)=>{
    setRoomNumber(e.target.value)
  }
  const handleBatchChange = (e)=>{
    setNewBatch(e.target.value)
  }
  const handleOption = ( std,e) => {
    console.log(e)
    if (e === "Move") {
      setCurrentStudent(std)
      setOpen(true)
    }else if(e === "Swap"){
      console.log("Swap")
      const lst=[...swapStudents,std]
      setSwapStudents([...swapStudents,std])
      if(lst.length==2){
        console.log(lst)
        const confirm=window.confirm(`Are you sure you want to swap ${lst[0].student_room} with ${lst[1].student_room}`)
        if(!confirm){
          setSwapStudents([])
          return
        }
        axios.post(`${backendUrl}/api/swap_room`, {student1:lst[0].student_email,student2:lst[1].student_email}, { withCredentials: true })
        .then((response) => {
          console.log(response.data)
          // setSwapStudents([])
          window.location.reload();
        })
      }
    }else if(e==="Change Batch"){
      setCurrentStudent(std)
      setOpen2(true)
    }
    return;
  };
  const handleCancel=()=>{
    setOpen(false)
    // setOpen2(false)
    setRoomNumber("")
    // setNewBatch("")
  }
  const handleCancel2=()=>{
    // setOpen(false)
    setOpen2(false)
    // setRoomNumber("")
    setNewBatch("")
  }
 
  const handleNewRoom=()=>{
    const confirm=window.confirm(`Are you sure you want to move student from ${currentStudent.student_room} to ${roomNumber}`)
    if(!confirm){
      setOpen(false)
      setRoomNumber("")
      return
    }
    axios.get(`${backendUrl}/api/new_room?old=${currentStudent.student_room}&new=${roomNumber}&student=${currentStudent.student_email}`, { withCredentials: true })
    .then((response) => {
      console.log(response.data)
      setOpen(false)
      setRoomNumber("")
      window.location.reload();
    })
  }
  const handleNewBatch=()=>{
    const confirm=window.confirm(`Are you sure you want to move student from ${currentStudent.student_batch} to ${newBatch}`)
    if(!confirm){
      setOpen2(false)
      setNewBatch("")
      return
    }
    axios.get(`${backendUrl}/api/new_batch?old=${currentStudent.student_batch}&new=${newBatch}&student=${currentStudent.student_email}`, { withCredentials: true })
    .then((response) => {
      console.log(response.data)
      setOpen(false)
      setRoomNumber("")
      window.location.reload();
    })
  }

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
                  student_prev_room
                },index) => {
                  // const [id, setId]=useState(null);
                  const handleApprove = () => {
                    console.log("Approve");
                    setShowPopup(true);
                    console.log(showPopup)
                  };
                  const handleClearSelection = () => {
                    // setShowPopup(false);
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
                            className="font-normal text-sm"
                          >
                            {student_email}
                          </Typography>
                        </div>
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-small text-sm"
                          >
                            {student_phone}
                          </Typography>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-blue-gray-50">
                       {student_prev_room}
                      </td>
                      <td
                        className="p-4 border-b border-blue-gray-50 w-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Select size="md" direction="down"
                          label={
                            // selectedOptions[application_id]?.value || "Select"
                            "Select"
                          }
                          onChange={(e) => handleOption({
                            student_room,
                            student_roll,
                            student_name,
                            student_batch,
                            student_phone,
                            student_email,
                          }, e)}
                        >
                          <Option value="Move">
                            Move
                          </Option>
                          <Option value="Swap">
                            Swap
                          </Option>
                          <Option value="Change Batch">
                            Change Batch
                          </Option>
                         </Select>
                         
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
          <Dialog open={open} className="bg-white">
            <DialogHeader>Change Room</DialogHeader>
             <DialogBody>
             <Input
                    label="Room Number"
                    type="text"
                    value={roomNumber}
                    onChange={handleRoomNumberChange}
                    className="mb-4" // Adds margin below the input
                />
            </DialogBody>
            <DialogFooter>
              <Button variant="gradient" color="green" onClick={handleNewRoom}>
                <span>Confirm</span>
              </Button>
              <Button variant="gradient" color="red" onClick={handleCancel}>
                <span>Cancel</span>
              </Button>
            </DialogFooter>
          </Dialog>
          <Dialog open={open2} className="bg-white">
            <DialogHeader>Change Batch</DialogHeader>
             <DialogBody>
             <Input
                    label="Batch"
                    type="text"
                    value={newBatch}
                    onChange={handleBatchChange}
                    className="mb-4" // Adds margin below the input
                />
            </DialogBody>
            <DialogFooter>
              <Button variant="gradient" color="green" onClick={handleNewBatch}>
                <span>Confirm</span>
              </Button>
              <Button variant="gradient" color="red" onClick={handleCancel2}>
                <span>Cancel</span>
              </Button>
            </DialogFooter>
          </Dialog>
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

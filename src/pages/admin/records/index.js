import Adminlayout from "@/src/layouts/Adminlayout";
import React, { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CommonButton from "@/src/components/CommonButton";
import { useDispatch } from "react-redux";
import AddAuction from "@/src/components/sections/AddAuction";
import { deleteAuction, getAuctionDetails } from "@/src/redux/action/auction";
import { setLoading } from "@/src/redux/reducer/loaderSlice";
import { getVehicleInfo } from "@/src/redux/action/vehicle";
import { AuctionStatus } from "@/src/data/datas";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ConfirmationModal from "@/src/components/modals/ConfirmationModal";
import { toast } from "react-toastify";
import AuctionView from "@/src/components/modals/AuctionView";
import { add } from "@/src/utils/ImagesPath";
import { deleteRecords, getAllRecordsDetails } from "@/src/redux/action/records";
import { getCustomerInfo } from "@/src/redux/action/customer";
import RecordsView from "@/src/components/modals/RecordsView";

const index = () => {
  const dispatch = useDispatch();
  const [showAddSection, setShowAddSection] = useState(false);
  const [recordData, setrecordData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [vehicleData, setVehicleData] = useState({});
  const [selectedrecordData, setSelectedrecordData] = useState(null);
  const [searchRegNo, setSearchRegNo] = useState("");
  const [searchRef, setsearchRef] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchStartDate, setSearchStartDate] = useState(null);
  const [searchEndDate, setSearchEndDate] = useState(null);
  const [filteredAuctionList, setFilteredAuctionList] = useState([]);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [auctionPerPage, setauctionPerPage] = useState(10);
  const indexOfLastAuction = currentPage * auctionPerPage;
  const indexOfFirstAuction = indexOfLastAuction - auctionPerPage;
  const currentAuction = filteredAuctionList.slice(
    indexOfFirstAuction,
    indexOfLastAuction
  );

  const HandleSearchRegNo = (event) => {
    setSearchRegNo(event.target.value);
  };

  const HandlesearchRef = (event) => {
    setsearchRef(event.target.value);
  };

  const HandleSelectStatus = (event) => {
    setSelectedStatus(event.target.value);
  };


  useEffect(() => {
    fetchRecordsDetails();
  }, []);

  const fetchRecordsDetails = () => {
    dispatch(setLoading(true));
    getAllRecordsDetails(async (res) => {
      if (res && res.data) {
        const record = Array.isArray(res.data) ? res.data : [];
        if (record.length === 0) {
          dispatch(setLoading(false));
          toast.info("No Auction data available");
          return;
        }
        setrecordData(record);
        dispatch(setLoading(false));

        const vehicleInfoPromises = record.map(
          (record) =>
            new Promise((resolve) => {
              getVehicleInfo(record.vehicleId, (response) =>
                resolve({ vehicleId: record.vehicleId, data: response.data })
              );
            })
        );
        const customerInfoPromises = record.map(
          (record) =>
            new Promise((resolve) => {
              getCustomerInfo(record.customerId, (response) =>
                resolve({ customerId: record.customerId, data: response.data })
              );
            })
        );

        try {
          const vehicleInfoResponses = await Promise.all(vehicleInfoPromises);
          const customerInfoResponses = await Promise.all(customerInfoPromises);

          const vehicleDataMap = {};
          const customerDataMap = {};

          vehicleInfoResponses.forEach((response) => {
            if (response.data) {
              vehicleDataMap[response.vehicleId] = response.data;
            }
          });
          customerInfoResponses.forEach((response) => {
            if (response.data) {
              customerDataMap[response.customerId] = response.data;
            }
          });

          setVehicleData(vehicleDataMap);
          setCustomerData(customerDataMap);
          dispatch(setLoading(false));
        } catch (error) {
          console.error("Error fetching vehicle details", error);
          toast.error("Error fetching additional details");
        }
      } else {
        dispatch(setLoading(false));
        console.error("Error fetching Auction details", res);
        toast.error("Error fetching Auction details");
      }
    });
  };

  

  const openDeleteConfirmationModal = (recordID) => {
    setSelectedrecordData(recordID);
    setDeleteConfirmationModal(true);
  };

  const closeDeleteConfirmationModal = () => {
    setDeleteConfirmationModal(false);
  };

  const deleterecordData = (auctionID) => {
    deleteRecords(auctionID, (res) => {
      if (res.status === 200) {
        toast.success(res.data.message);
        fetchRecordsDetails();
        closeDeleteConfirmationModal();
      } else {
        toast.error(res.data.message);
      }
    });
  };

  const OpenAuctionViewModal = (auction) => {
    setSelectedrecordData(auction);
    setShowViewModal(true);
  };

  const handleSearchByRefID = (event) => {
    event.preventDefault();
    const searchedRef = recordData.find(
      (auction) => auction.auctionRefID === searchRef
    );
    if (searchedRef) {
      setSelectedrecordData(searchedRef);
      setShowViewModal(true);
      setsearchRef("");
    } else {
      toast.error("Invalid RefID");
    }
  };

  const handleSearchByRegNo = (event) => {
    event.preventDefault();
    const searchedAuction = recordData.find(
      (auction) => vehicleData[auction.vehicleId]?.registerno === searchRegNo
    );
    if (searchedAuction) {
      setSelectedrecordData(searchedAuction);
      setShowViewModal(true);
      setSearchRegNo("");
    } else {
      toast.error("Invalid RegNo");
    }
  };

  return (
    <Adminlayout>
        <div>
          
          {/* <div className="Filter-Search-Container container-fluid mb-4">
            <h1 className="row ps-2 mb-3">Filter and Search</h1>
            <div className="row pb-2">
              <div className="col-lg-3 col-md-6 col-sm-12 pb-2">
                <div className="search-input-container">
                  <form onSubmit={handleSearchByRefID}>
                    <input
                      className="SearchBox"
                      type="text"
                      placeholder="Ref ID"
                      value={searchRef}
                      onChange={HandlesearchRef}
                    />
                    <div className="search-icon">
                      <SearchIcon />
                    </div>
                    {searchRef && (
                      <div
                        className="search-icon"
                        style={{
                          zIndex: "100",
                          backgroundColor: "white",
                          right: "2%",
                        }}
                        onClick={() => setsearchRef("")}
                      >
                        <ClearIcon />
                      </div>
                    )}
                  </form>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 col-sm-12 pb-2">
                <div className="search-input-container">
                  <form onSubmit={handleSearchByRegNo}>
                    <input
                      className="SearchBox"
                      type="text"
                      placeholder="Filter By Register No"
                      value={searchRegNo}
                      onChange={HandleSearchRegNo}
                    />
                    <div className="search-icon">
                      <SearchIcon />
                    </div>
                    {searchRegNo && (
                      <div
                        className="search-icon"
                        style={{
                          zIndex: "100",
                          backgroundColor: "white",
                          right: "2%",
                        }}
                        onClick={() => setSearchRegNo("")}
                      >
                        <ClearIcon />
                      </div>
                    )}
                  </form>
                </div>
              </div>
              <div className="col-lg-2 col-md-6 col-sm-12 pb-2">
                <div className="search-input-container z-2">
                  <DatePicker
                    selected={searchStartDate}
                    onChange={(date) => setSearchStartDate(date)}
                    className="SearchBox"
                    placeholderText="Filter By Start Date"
                  />
                  {searchStartDate && (
                    <div
                      className="search-icon"
                      style={{
                        zIndex: "100",
                        backgroundColor: "white",
                        right: "2%",
                      }}
                      onClick={() => setSearchStartDate(null)}
                    >
                      <ClearIcon />
                    </div>
                  )}
                </div>
              </div>
              <div className="col-lg-2 col-md-6 col-sm-12 pb-2">
                <div className="search-input-container z-2">
                  <DatePicker
                    selected={searchEndDate}
                    onChange={(date) => setSearchEndDate(date)}
                    className="SearchBox"
                    placeholderText="Filter By End Date"
                  />
                  {searchEndDate && (
                    <div
                      className="search-icon"
                      style={{
                        zIndex: "100",
                        backgroundColor: "white",
                        right: "2%",
                      }}
                      onClick={() => setSearchEndDate(null)}
                    >
                      <ClearIcon />
                    </div>
                  )}
                </div>
              </div>
              <div className="col-lg-2 col-md-6 col-sm-12 pb-2">
                <div className="search-input-container">
                  <select
                    className="SearchBox"
                    value={selectedStatus}
                    onChange={HandleSelectStatus}
                  >
                    <option value="">Select Status</option>
                    {AuctionStatus.map((data, index) => (
                      <option key={index} value={data}>
                        {data}
                      </option>
                    ))}
                  </select>
                  {selectedStatus && (
                    <div
                      className="search-icon"
                      style={{
                        zIndex: "100",
                        backgroundColor: "white",
                        right: "2%",
                      }}
                      onClick={() => setSelectedStatus("")}
                    >
                      <ClearIcon />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div> */}
          <div className="TableSection mb-3">
            <table className="table table-striped table-hover">
              <thead className="top-0 position-sticky z-1">
                <tr>
                  <th scope="col" className="col-1">
                    No
                  </th>
                  <th scope="col" className="col-2">
                    Record RefID
                  </th>
                  <th scope="col" className="col-2">
                    Vehicle RegisterNo
                  </th>
                  <th scope="col" className="col-2">
                    Customer Email
                  </th>
                  <th scope="col" className="col-2">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {recordData.length > 0 ? (
                  recordData.map((record, index) => (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{record.recordsRefID}</td>
                      <td>
                        {vehicleData[record.vehicleId]?.registerno || "N/A"}
                      </td>
                      <td>
                        {customerData[record.customerId]?.email || "N/A"}
                      </td>
                      <td className="col-2">
                        <IconButton
                          aria-label="delete"
                          className="viewbutt"
                          onClick={() => OpenAuctionViewModal(record)}
                        >
                          <VisibilityIcon className="" />
                        </IconButton>
                        {/* <IconButton
                          aria-label="delete"
                          className="viewbutt"
                          // onClick={() => OpenVehicleEditModal(vehicle)}
                        >
                          <EditIcon className="text-success" />
                        </IconButton> */}
                        <IconButton
                          aria-label="delete"
                          className="viewbutt"
                          onClick={() =>
                            openDeleteConfirmationModal(record._id)
                          }
                        >
                          <DeleteIcon className="text-danger" />
                        </IconButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No results found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="Filter-Search-Container d-flex justify-content-between pe-3 p-4">
            <div className="Pagination-Text">
              <p>
                Page {currentPage} of{" "}
                {Math.ceil(filteredAuctionList.length / auctionPerPage)}
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ width: 120 }}
              >
                Previous
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={indexOfLastAuction >= filteredAuctionList.length}
                style={{ width: 120 }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      <RecordsView
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        recordsDetails={selectedrecordData}
      />
      <ConfirmationModal
        show={deleteConfirmationModal}
        message="Are you sure you want to delete this Details?"
        heading="Confirmation Delete !"
        variant="danger"
        onConfirm={() => deleterecordData(selectedrecordData)}
        onCancel={closeDeleteConfirmationModal}
      />
    </Adminlayout>
  );
};

export default index;

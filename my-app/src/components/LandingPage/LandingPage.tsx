import { useEffect, useState, ReactNode, } from "react";
import style from "./LandingPage.module.css";
import { checkInDataFormat, checkinDataObject } from "../../types/checkInDataTypes";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import { CheckInForm } from "../CheckInForm/CheckInForm";
import { CheckInTable } from "../CheckInTable/CheckInTable";

export function LandingPage(): ReactNode | Promise<ReactNode> {
    const [tableListData, setTableListData] = useState<checkInDataFormat[]>([]);
    const [tableCellId, setTableCellId] = useState(0);
  
    useEffect(() => {
      const controller = new AbortController();
      const signal = controller.signal;
      async function fetchTableData() {
        const url = "/api/guest/all";
        try {
          const response = await fetch(url, {signal: signal});
          if (!response.ok) {
            throw new Error("Failed to fetch all guest data");
          }
    
          const json = await response.json();
          setTableListData(json);
        } catch (error: any) {
          if (error.name !== 'AbortError')
            console.error(error);
        }
      }
      fetchTableData();
      return () => {
        controller.abort();
      }
    }, []);
  
    function convertListOfObjectsOrObjectToJSX(listOfObjects: (checkinDataObject[] | checkinDataObject)) {
      if (!Array.isArray(listOfObjects)) {
        const object: checkinDataObject = listOfObjects;
        let totalElements = (object.id === undefined || object.id === null) ? 1 : 0;
        const itemIdToDisplay = object.id !== undefined ? object.id : totalElements + tableCellId;
        
        const udpatedObject = (
          <tr key={itemIdToDisplay}>
            <td>{object.firstName}</td>
            <td>{object.lastName}</td>
            <td>{object.message}</td>
          </tr>
        );
        setTableCellId((prev) => prev + totalElements);
        return udpatedObject;
      }
  
      let totalElements = 0;
      const updatedList = listOfObjects.slice(0,50).map((item: checkinDataObject, index: number) => {
        if (item.id === undefined || item.id === null) {
          totalElements += 1
        }
        const itemIdToDisplay = item.id !== undefined ? item.id : index + tableCellId;
        return (
          <tr key={itemIdToDisplay}>
            <td>{item.firstName}</td>
            <td>{item.lastName}</td>
            <td>{item.message}</td>
          </tr>
        );
      });
      setTableCellId((prev) => prev + totalElements);
      return updatedList;
    }
  
    return (
      <div className={style.landingPage}>
        <Header />
        <CheckInForm setTableListData={setTableListData} tableCellId={tableCellId} setTableCellId={setTableCellId}/>
        <CheckInTable tableListData={tableListData} convertListOfObjectsOrObjectToJSX={convertListOfObjectsOrObjectToJSX}/>
        <Footer />
      </div>
    )
  }
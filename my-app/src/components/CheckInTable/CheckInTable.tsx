import { useEffect, useState } from "react";
import style from "./CheckInTable.module.css";

export function CheckInTable({ tableListData , convertListOfObjectsOrObjectToJSX }: any) {
  const [jsxTableListData, setJsxTableListData] = useState([]);
  useEffect(() => {
    setJsxTableListData(convertListOfObjectsOrObjectToJSX(tableListData))
  }, [tableListData])


  return (
    <div className={style.table}>
      <h2> Past Check-in Records</h2>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {jsxTableListData && jsxTableListData.length > 0 ? jsxTableListData : (
            <tr>
              <td>Null</td>
              <td>Null</td>
              <td>Null</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
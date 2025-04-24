import { useCurrentUser } from "../../userContext";
import { useEffect, useState, ReactNode } from "react";
import { checkInDataFormat } from "../../types/checkInDataTypes";
import "./MyCheckInPage.css";

export function MyCheckInPage(): ReactNode | Promise<ReactNode> {
    const useUser = useCurrentUser();
    const [checkInData, setCheckInData] = useState([]);
  
    useEffect(() => {
      if (useUser.user === null || useUser.user === undefined) {
        return;
      }
  
      const controller = new AbortController();
      const signal = controller.signal;
  
      const fetchGuestData = async () => {
        const guestId = useUser.user;
        const url = `/api/guest/${guestId}`;
        // const testUrl = `http://localhost:4000/guest/${guestId}`
        try {
          const response = await fetch(url, {signal: signal});
          if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }
    
          const data = await response.json();
          setCheckInData(data);
        } catch (error: any) {
          if (error.name !== "AbortError")
            console.error(error);
        }
      }
      fetchGuestData();
  
      return () => {
        controller.abort();
      }
    }, [useUser.user])
  
    async function handleDeleteCheckin(key: string) {
      const url = `/api/guest/new-check-in`;
      try {
        const response = await fetch(url, {
          method: 'DELETE',
          body: JSON.stringify({
            checkInId: key, 
            guestId: useUser.user,
          }),
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          }
        });
        if (!response.ok) {
          throw new Error(JSON.stringify(response.body));
        }
        
        setCheckInData((prev) => 
          prev ? prev.filter(
            (x: checkInDataFormat) => x.id !== key
          ) : []
        );
  
      } catch (error) {
        console.error(error);
      } 
  
    }
  
    return (
      <div className={checkInData.length > 0 ? "checkin_content" : "checkin_empty"}>
        <h3> My Checkins </h3>
        <ul>
          {
            checkInData.length > 0 ? 
            checkInData.map((item: checkInDataFormat) => (<li key={item.id}> {`Check-in Id: ${item.id}; Name: ${item.firstName} ${item.lastName};  Message: ${item.message}`} <span className="hover-link" key={item.id} onClick={() => handleDeleteCheckin(item.id)}> &#10006; </span> </li>)) :
            (<> <h2> No checkins available yet </h2> </>)
          }
        </ul>
      </div>
    );
  }
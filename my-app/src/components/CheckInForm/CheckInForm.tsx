import { useForm } from "../../hooks/useForm";
import { checkInDataFormat } from "../../types/checkInDataTypes";
import { useCurrentUser, useLogout } from "../../userContext";
import styles from "./CheckInForm.module.css";

// Has an image behind it
export function CheckInForm({ setTableListData, tableCellId, setTableCellId }: any) {
  const { formData, error, setCustomErrorTimeout, handleFormDataChange  } = useForm({
    firstName: '',
    lastName: '',
    message: '',
    phoneNumber: ''
  });
  const userContext = useCurrentUser();
  let isLoggedIn = userContext.user !== null && userContext.user !== undefined;
  let logout = useLogout();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Post to /guest/new-check-in endpoint
    if (!isLoggedIn) {
      setCustomErrorTimeout("Not logged in");
      return; 
    }

    if (!formData.firstName || !formData.lastName || !formData.message || !formData.phoneNumber) {
      setCustomErrorTimeout("Invalid form data");
      return;
    }

    const url = "/api/guest/new-check-in";
    // const testUrl = "http://localhost:4000/guest/new-check-in";
    
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          guestId: userContext.user,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
        }
        const json = await response.json();
        throw new Error(json.error);
      }

      // Update Check In Table
      const newTableCellId = tableCellId;
      setTableCellId((n: number) => n + 1);

      setTableListData((prev: checkInDataFormat[]) => [
        ...prev,
        { 
          id: newTableCellId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          message: formData.message,
        }
      ]);


    } catch (error: any) {
      setCustomErrorTimeout(error.message);
      console.error(error.message);
    }
  }

  async function handleFormOnChange(_e: any) {
    handleFormDataChange(_e);
  }


  return (
    <div className={styles.checkin_form_wrapper}>
      <img className={styles.checkinFormImg} src="https://fiverr-res.cloudinary.com/images/q_auto,f_auto/gigs/124714084/original/762ca0507089ff647bf1c46d1c123e6603af95dc/send-20-high-quality-4k-random-wallpapers.jpg" alt=""/>
      <form onSubmit={handleSubmit} onChange={handleFormOnChange} className={styles.checkin_form}>
        <h2> Submit a check-in </h2>
        <label htmlFor="firstName">First Name </label>
        <input type="text" name="firstName" id="" />
        <label htmlFor="lastName">Last Name</label>
        <input type="text" name="lastName" id="" />
        <label htmlFor="message">Message</label>
        <textarea name="message"/>
        <label htmlFor="phoneNumber">Phone Number</label>
        <input type="tel" name="phoneNumber" id="" />
        <button type="submit" className="submit-btn"> Submit </button>
        {
          (error && error.length > 0) && <h4 className="error"> {error} </h4>
        }
    </form>
    </div>
  )
}
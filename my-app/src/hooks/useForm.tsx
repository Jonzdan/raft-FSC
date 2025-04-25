import { useEffect, useState, useRef } from "react";

export function useForm(initialState: any) {
    const [formData, setFormData] = useState(initialState);
    const [error, setError] = useState('');
    const timeoutRefs = useRef<number[]>([]);
  
    useEffect( () => {
      return () => {
        timeoutRefs.current.forEach(clearTimeout);
        timeoutRefs.current = [];
      }
    }, []);
  
    const setCustomErrorTimeout = (message: string) => {
      setError(message);
      const timeoutId = setTimeout(() => {
        setError('');
        timeoutRefs.current.filter(id => id != timeoutId);
      }, 2000);
      timeoutRefs.current.push(timeoutId);
    }
  
    const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      
      if (!(Object.keys(formData).includes(name))) {
        setCustomErrorTimeout("Unknown Form Field");
        return;
      }
      setFormData((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    };
    const setCustomTimeout = (func: Function, args: [any], delay: number) => {
        const timeoutId = setTimeout(() => {
          func(...args);
          timeoutRefs.current.filter(id => id != timeoutId);
        }, delay);
        timeoutRefs.current.push(timeoutId);
      }
    
      return {
        formData,
        setFormData,
        error,
        handleFormDataChange,
        setCustomErrorTimeout,
        setCustomTimeout,
      }
}
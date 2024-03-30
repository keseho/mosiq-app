import Image from "next/image";
import { useEffect, useState } from "react";

export const Loading = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 500); // Delay before showing the animation

    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      className={`flex w-full h-full items-center justify-center bg-white ${
        show ? "opacity-100" : "opacity-0"
      } transition-opacity duration-500`}
    >
      <Image src={"/logo.svg"} alt="logo" width={200} height={200} />
    </main>
  );
};

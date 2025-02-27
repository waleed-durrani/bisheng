import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import "reactflow/dist/style.css";
import "./App.css";

import { ErrorBoundary } from "react-error-boundary";
import ErrorAlert from "./alerts/error";
import NoticeAlert from "./alerts/notice";
import SuccessAlert from "./alerts/success";
import CrashErrorComponent from "./components/CrashErrorComponent";
import { alertContext } from "./contexts/alertContext";
import { locationContext } from "./contexts/locationContext";
import { TabsContext } from "./contexts/tabsContext";
import { LoginPage } from "./pages/login";
import router from "./routes";
import { userContext } from "./contexts/userContext";

export default function App() {
  let { setCurrent, setShowSideBar, setIsStackedOpen } = useContext(locationContext);
  // let location = useLocation();
  useEffect(() => {
    setCurrent(location.pathname.replace(/\/$/g, "").split("/"));
    setShowSideBar(true);
    setIsStackedOpen(true);
  }, [setCurrent, setIsStackedOpen, setShowSideBar]);
  const { hardReset } = useContext(TabsContext);
  const {
    errorData,
    errorOpen,
    setErrorOpen,
    noticeData,
    noticeOpen,
    setNoticeOpen,
    successData,
    successOpen,
    setErrorData,
    setSuccessOpen,
  } = useContext(alertContext);

  // Initialize state variable for the list of alerts
  const [alertsList, setAlertsList] = useState<
    Array<{
      type: string;
      data: { title: string; list?: Array<string>; link?: string };
      id: string;
    }>
  >([]);

  // Use effect hook to update alertsList when a new alert is added
  useEffect(() => {
    // If there is an error alert open with data, add it to the alertsList
    if (errorOpen && errorData) {
      if (
        alertsList.length > 0 &&
        JSON.stringify(alertsList[alertsList.length - 1].data) ===
        JSON.stringify(errorData)
      ) {
        return;
      }
      setErrorOpen(false);
      setAlertsList((old) => {
        let newAlertsList = [
          ...old,
          { type: "error", data: _.cloneDeep(errorData), id: _.uniqueId() },
        ];
        return newAlertsList;
      });
    }
    // If there is a notice alert open with data, add it to the alertsList
    else if (noticeOpen && noticeData) {
      if (
        alertsList.length > 0 &&
        JSON.stringify(alertsList[alertsList.length - 1].data) ===
        JSON.stringify(noticeData)
      ) {
        return;
      }
      setNoticeOpen(false);
      setAlertsList((old) => {
        let newAlertsList = [
          ...old,
          { type: "notice", data: _.cloneDeep(noticeData), id: _.uniqueId() },
        ];
        return newAlertsList;
      });
    }
    // If there is a success alert open with data, add it to the alertsList
    else if (successOpen && successData) {
      if (
        alertsList.length > 0 &&
        JSON.stringify(alertsList[alertsList.length - 1].data) ===
        JSON.stringify(successData)
      ) {
        return;
      }
      setSuccessOpen(false);
      setAlertsList((old) => {
        let newAlertsList = [
          ...old,
          { type: "success", data: _.cloneDeep(successData), id: _.uniqueId() },
        ];
        return newAlertsList;
      });
    }
  }, [
    _,
    errorData,
    errorOpen,
    noticeData,
    noticeOpen,
    setErrorOpen,
    setNoticeOpen,
    setSuccessOpen,
    successData,
    successOpen,
  ]);

  const removeAlert = (id: string) => {
    setAlertsList((prevAlertsList) =>
      prevAlertsList.filter((alert) => alert.id !== id)
    );
  };

  const { user, setUser } = useContext(userContext);

  // 退出
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.keyCode === 81) {
        setUser(null)
        localStorage.setItem('UUR_INFO', '')
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    //need parent component with width and height
    <div className="flex h-full flex-col">
      <ErrorBoundary
        onReset={() => {
          window.localStorage.removeItem("tabsData");
          // window.localStorage.clear();
          hardReset();
          window.location.href = window.location.href;
        }}
        FallbackComponent={CrashErrorComponent}
      >
        {/* <Header /> */}
        {user ? <RouterProvider router={router} /> : <LoginPage></LoginPage>}
      </ErrorBoundary>
      <div></div>
      <div className="app-div" style={{ zIndex: 999 }}>
        {alertsList.map((alert) => (
          <div key={alert.id}>
            {alert.type === "error" ? (
              <ErrorAlert
                key={alert.id}
                title={alert.data.title}
                list={alert.data.list}
                id={alert.id}
                removeAlert={removeAlert}
              />
            ) : alert.type === "notice" ? (
              <NoticeAlert
                key={alert.id}
                title={alert.data.title}
                link={alert.data.link}
                id={alert.id}
                removeAlert={removeAlert}
              />
            ) : (
              <SuccessAlert
                key={alert.id}
                title={alert.data.title}
                id={alert.id}
                removeAlert={removeAlert}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  updateTable,
} from "../../../services/restaurantFloorService";
import * as styled from "./Seating.styles";
import WorkDayContext from "../WorkDayContext";
import { useContext } from "react";
import { IUser } from "../../../dataTypes/user";
import { addOrder } from "../../../services/dinerOrdersService";
import { ITable } from "@/dataTypes/table";
import { getActiveUsers } from "../../../services/userServices";

const Seating = () => {
  const { table, setAction, setClickTableId, floorLayout, fetchFloor } =
    useContext(WorkDayContext);
  const [waiters, setWaiters] = useState<IUser[]>([]);
  const [isConnect, setisConnect] = useState(false);
  const [currentWaiter, setcurrentWaiter] = useState<number>();
  const [nDiners, setnDiners] = useState<number>();
  const [connectedto, setconnectedto] = useState<number>(0);
  const [waiterData, setwaiterData] = useState<any>({});


  const getWaiters = async () => {
    const allUsers: IUser[] = await getActiveUsers();
  
    console.log("🧪 Users with role_id:");
    allUsers.forEach((user: IUser) => {
      console.log(`id: ${user.id}, role_id:`, user.role_id, typeof user.role_id);
    });
  
    const waiterUsers = allUsers.filter((u: IUser) => u.role_id === 3);
    console.log("✅ Filtered Waiters:", waiterUsers);
  
    setWaiters(waiterUsers);
  };
  
  

  useEffect(() => {
    getWaiters();
  }, []);

  const connectTableClick = () => {
    setisConnect(!isConnect);
  };

  const closePopUp = () => {
    setClickTableId(null);
    setAction("");
  };

  const onSeat = async() => {
    let config_: ITable = { ...table?.config } as ITable;
    if (!connectedto && (!nDiners || !currentWaiter))
      alert("אנא מלאו שדות חסרים");
    else {
      if (!isConnect) {
        await addOrder({order: {
          table_id: table?.config.id,
          table_name: config_.name,
          n_diners: nDiners,
          waiter_id: currentWaiter,
          total: 0,
          paid:0,
        }});
      } else {
        config_.connected_to = connectedto;
        await updateTable(table?.config.id!, config_);
      }
       await fetchFloor();
      closePopUp();
    }
  };

  const Handlecurrentwaiter = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(event.target.value);
    setcurrentWaiter(Number(event.target.value));
  };

  const Handlediners = (event: React.ChangeEvent<HTMLInputElement>) => {
    setnDiners(Number(event.target.value));
  };
  const Handleconnectedto = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setconnectedto(Number(event.target.value));
  };

  return (
    <styled.SeatingPage>
      <styled.PageTitleAndExitButton>
        <styled.PageTitle>{table?.config.name} הושבה בשולחן</styled.PageTitle>
        <styled.ExitButton onClick={closePopUp}>x</styled.ExitButton>
      </styled.PageTitleAndExitButton>
      <styled.waiter isConnect={isConnect}>
        <select
          disabled={isConnect}
          onChange={Handlecurrentwaiter}
          value={currentWaiter}
        >
          <option />
          {waiters.map((waiter) => (
            <option value={waiter.id}>
              {waiter.first_name + "  " + waiter.last_name}
            </option>
          ))}
        </select>
        :מלצר
      </styled.waiter>
      <styled.Diners isConnect={isConnect ? true : false}>
        <styled.NumberDiners
          type="number"
          min={0}
          disabled={isConnect}
          isConnect={isConnect ? true : false}
          placeholder="0"
          onChange={Handlediners}
          value={nDiners}
        />
        : כמות סועדים
      </styled.Diners>
      <styled.ConnectionTable>
        <select
          disabled={!isConnect}
          onChange={Handleconnectedto}
          value={connectedto}
        >
          <option value="option"></option>
          {floorLayout.map((table) =>
            table.config.type === "table" && table.order && !(table.config.connected_to) ? (
              <option value={table.config.id}>{table.config.name}</option>
            ) : null
          )}
        </select>
        <styled.ConnectionTableText color={!isConnect ? "#aaaaaa" : ""}>
          :חיבור לשולחן אחר
        </styled.ConnectionTableText>
        <styled.ConnectionTableButton
          type="checkbox"
          onChange={connectTableClick}
        />
      </styled.ConnectionTable>
      <styled.Confirm onClick={onSeat}>אישור</styled.Confirm>
    </styled.SeatingPage>
  );
};

export default Seating;

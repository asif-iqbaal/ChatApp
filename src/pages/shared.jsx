import { Outlet } from "react-router-dom"
import Chat from "../chat/chat"

export default function pages(){
    return(
        <>
        <div className="flex flex-1 justify-center items-center">
            <Chat />
            <div>
                <Outlet />
            </div>
        </div>
        </>
    )
}
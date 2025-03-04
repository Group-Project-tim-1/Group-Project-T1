import Chatbox from "../components/Chatbox"
import User1 from "../components/User1"
import User2 from "../components/User2"


export default function PlayGround() {

    return (
        <>
      <div className='flex flex-row justify-center'>
          <div className="">
            <User1/>
          </div>
          <div>
            <User2/>
            <Chatbox/>
          </div>
      </div>
    </>
    )
}
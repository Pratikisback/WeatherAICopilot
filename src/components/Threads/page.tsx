import { viewThreadById } from "@/redux/features/threadSlice";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, Thread } from "../../models/MessageModel";
const ThreadBox = () => {
  const dispatch = useDispatch();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const threads = useSelector((state: RootState) => state.threads.threads);
  const selectedThread = useSelector(
    (state: RootState) => state.threads.currentThread
  );
  const selectThread = (threadId: string) => {
    // Functionality to select and load a chat thread

    dispatch(viewThreadById(threadId));
  };

  return (
    <div className="py-5 px-3">
      <h2 className="text-2xl font-bold mb-4 text-nowrap ">Saved Threads</h2>
      <ul>
        {threads.map((thread: Thread) => (
          <li
            key={thread.id}
            onClick={() => {
              selectThread(thread.id);
            }}
            className="mb-2 p-2 border rounded hover:bg-gray-100 cursor-pointer"
          >
            {thread.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ThreadBox;

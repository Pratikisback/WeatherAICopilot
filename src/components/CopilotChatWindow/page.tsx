"use client";
import {
  addThread,
  clearCurrentThread,
  updateThread,
  viewThreadById,
} from "@/redux/features/threadSlice";
import { ArrowDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BouncingDots from "../BouncingComponent";

const CopilotChatWindow = () => {
  const [query, setQuery] = useState<{ role: string; content: string }>({
    role: "user",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const selectedThread = useSelector(
    (state: any) => state.threads.currentThread
  );
  const dispatch = useDispatch();

  const handleSetQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery((prev) => ({
      ...prev,
      role: "user",
      content: e.target.value,
    }));
  };

  const handleNewThread = () => {
    setMessages([]); // clear chat
    // generate a new unique threadId
    setQuery({
      role: "user",
      content: "",
    });
    // This is strictly important so that the current thread in the redux is also cleared and no thread is active when we click on new thread. and thus, a new thread wont be having a previous thread's id. This actually took me a a while to figure out.
    dispatch(clearCurrentThread());
  };

  const handleQuerySend = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessages((prev) => [...prev, query]);
    setQuery({ role: "user", content: "" });
    const body = {
      messages: [
        {
          role: "user",
          content: query?.content,
        },
      ],
      runId: "weatherAgent",
      maxRetries: 2,
      maxSteps: 5,
      temperature: 0.5,
      topP: 1,
      runtimeContext: {},
      threadId: "16",
      resourceId: "weatherAgent",
    };

    try {
      setLoading(true);
      const apiUrl: string | undefined = process.env.NEXT_PUBLIC_API_BASE_URL;

      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in .env");
      }

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xx-mastra-dev-playground": "true",
          Connection: "keep-alive",
        },
        body: JSON.stringify(body),
      });

      // Stream handling
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let partial = "";
      // Prepare to append assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        partial += decoder.decode(value, { stream: true });

        // Process each complete line
        let lines = partial.split("\n");
        partial = lines.pop()!; // keep the incomplete part for next chunk

        console.log(lines, "lines");
        for (const line of lines) {
          if (!line.trim()) continue;

          const [prefix, jsonStr] = line.split(":", 2);
          let cleanToken = jsonStr;

          if (prefix === "0") {
            cleanToken = jsonStr
              .replace(/^"+|"+$/g, " ")
              .replace(/\\n/g, "<br />"); // strip extra quotes

            // Set the response in the last index state that we created with the updated last message and add the new message in the last oobject of the array of messages that we have above.

            setMessages((prev) => {
              const lastIndex = prev.length - 1;
              const updated = [...prev]; // copy the object array to avoid mutating state directly, so no duplictaes will be puhsed.
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: updated[lastIndex].content + cleanToken,
              };
              return updated;
            });
          }
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error in sending query:", err);
      setLoading(false);
    }
  };

  const saveThread = () => {
    if (messages.length === 0) return;

    // If we're already in an active thread, just update it
    if (selectedThread && selectedThread.activeThread && selectedThread.id) {
      dispatch(
        updateThread({
          ...selectedThread,
          messageThread: messages, // overwrite with latest messages
        })
      );
      return; // don’t create a new thread
    }

    // Otherwise, prompt user to create a new thread
    const threadName = prompt("Enter a name for this chat thread:");
    const threadId = new Date().getTime().toString();

    if (threadName) {
      dispatch(
        addThread({
          id: threadId,
          messageThread: messages,
          name: threadName ?? "New Thread",
          isSaved: true,
          activeThread: true,
        })
      );

      dispatch(
        updateThread({
          id: threadId,
          messageThread: messages,
          name: threadName ?? "New Thread",
          isSaved: true,
          activeThread: true,
        })
      );
    }
  };

  useEffect(() => {
    if (selectedThread && selectedThread.activeThread) {
      setMessages(selectedThread.messageThread);
    }
  }, [selectedThread]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Detect if user scrolls up
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50; // tolerance
      setShowScrollButton(!isAtBottom);
    }
  };

  // Scroll manually when arrow clicked
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full min-h-screen md:py-5 flex-col items-center relative px-2">
      <div className="flex flex-row h-full items-end gap-3 justify-end mb-4 relative w-full">
        <div
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer w-auto"
          onClick={handleNewThread}
        >
          New Chat
        </div>
          {messages.length > 0 && (
            <div
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer w-auto"
              onClick={saveThread}
            >
              Save Chat
            </div>
          )}
      </div>
      <div
        className="h-[80vh] relative max-h-[80vh] overflow-y-auto flex flex-col items-end md:justify-end"
        ref={containerRef} // ← Add this ref
        onScroll={handleScroll}
      >
        <>
          {loading ? (
            <BouncingDots />
          ) : (
            messages.map(
              (
                message: { role: string; content: string },
                messageIndex: number
              ) => (
                <p
                  key={messageIndex}
                  className={`text-lg w-full mb-8 ${
                    message.role === "user"
                      ? "text-right font-semibold"
                      : "text-left"
                  }`}
                  dangerouslySetInnerHTML={{ __html: message.content }}
                />
              )
            )
          )}
          <div ref={messagesEndRef} />
        </>
      </div>
      <div className="absolute left-0 flex justify-center bottom-5 right-0 w-full">
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className=" bg-gray-800 cursor-pointer  text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition"
          >
            <ArrowDown size={20} />
          </button>
        )}
      </div>
      <form
        onSubmit={handleQuerySend}
        className="md:w-1/2 w-full mx-auto relative h-[10vh] flex items-center"
      >
        <input
          type="text"
          value={query.content}
          onChange={(e) => handleSetQuery(e)}
          className="border border-black p-2 rounded w-full px-2 py-3 text-lg"
          placeholder="Enter text here"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute right-3 cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default CopilotChatWindow;

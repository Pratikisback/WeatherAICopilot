import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Threads, Messages, Message, Thread } from "../../models/MessageModel";

const initialState: { threads: Threads; currentThread: Thread | null } = {
  threads: [],
  currentThread: null,
};
export const threadSlice = createSlice({
  name: "threads",
  initialState,
  reducers: {
    updateThread: (state, action: PayloadAction<Thread>) => {
      const index = state.threads.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.threads[index] = { ...state.threads[index], ...action.payload };
        state.currentThread = state.threads[index]; // keep current in sync
        state.currentThread.activeThread = true;
      }
    },
    addThread: (state, action: PayloadAction<Thread>) => {
      state.threads = state.threads.map((thread) => ({
        ...thread,
        activeThread: false,
      }));

      // Add new thread
      state.threads.push(action.payload);

      // Set as current thread
      state.currentThread = action.payload;
    },
    viewThreadById: (state, action: PayloadAction<string>) => {
      const threads = state.threads.map((thread) => ({
        ...thread,
        activeThread: thread.id === action.payload,
      }));
      state.threads = threads;

      // Set current thread
      const activeThread = threads.find(
        (thread) => thread.id === action.payload
      );
      state.currentThread = activeThread || { id: "", messageThread: [] };
    },
    clearCurrentThread: (state) => {
      // Clear current thread and deactivate all threads
      state.threads = state.threads.map((thread) => ({
        ...thread,
        activeThread: false,
      }));
      state.currentThread = null;
    },
  },
});
export const { addThread, viewThreadById, updateThread, clearCurrentThread } =
  threadSlice.actions;
export default threadSlice.reducer;

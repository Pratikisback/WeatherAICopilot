export type Message = {
  role: string;
  content: string;
};

export type Messages = Message[];

export type Thread = {
  id: string;
  messageThread: Messages;
  name?: string;
  isSaved?: boolean;
  activeThread?: boolean;
};
export type Threads = Thread[];


export interface ThreadsState {
  currentThread: Thread | null;
  threads: Threads;
}

export interface RootState {
  threads: ThreadsState;
}
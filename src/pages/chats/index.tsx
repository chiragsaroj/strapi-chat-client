import { useEffect, useState } from 'react';
import { Fragment } from 'react/jsx-runtime';
import dayjs from 'dayjs';
import {
  IconArrowLeft,
  IconMessages,
  IconPlus,
  IconSend,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Layout } from '@/components/custom/layout';
import ThemeSwitch from '@/components/theme-switch';
import { Button } from '@/components/custom/button';
import { useLocalStorage } from 'usehooks-ts';
import io from 'socket.io-client';
import { nanoid } from 'nanoid';

const socket = io('http://localhost:1337');

interface Convo {
  sender: string;
  message: string;
  timestamp: string;
}

interface ChatUser {
  id: string;
  name: string;
  messages: Convo[];
}

export default function Chats() {
  const [inputMsg, setInputMsg] = useState('');
  const [conv, setConv] = useLocalStorage<ChatUser[]>('convo', []);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(conv[0]);
  const [mobileSelectedUser, setMobileSelectedUser] = useState<ChatUser | null>(
    null
  );

  const currentMessage =
    selectedUser?.messages?.reduce((acc: Record<string, Convo[]>, obj) => {
      const key = dayjs(obj.timestamp).format('D MMM, YYYY');

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(obj);

      return acc;
    }, {}) || {};

  useEffect(() => {
    socket.on('connect', () => {
      console.log(`You are now connected to ${socket.id}`);
    });

    socket.on('receive-message', (message) => {
      if (selectedUser) {
        const newMessage: Convo = {
          sender: 'Assistant',
          message: message,
          timestamp: `${dayjs()}`,
        };

        console.log(newMessage)

        setConv((prevConv) => {
          return prevConv.map((chatUsr) => {
            if (chatUsr.id === selectedUser.id) {
              return {
                ...chatUsr,
                messages: [newMessage, ...chatUsr.messages],
              };
            }
            return chatUsr;
          });
        });

        setSelectedUser((prevSelectedUser) => {
          if (prevSelectedUser) {
            return {
              ...prevSelectedUser,
              messages: [newMessage, ...prevSelectedUser.messages],
            };
          }
          return prevSelectedUser;
        });
      }
    });

    return () => {
      socket.off('connect');
      socket.off('receive-message');
    };
  }, [selectedUser]);

  const sendMessage = () => {
    if (inputMsg?.length > 0) {
      socket.emit('send-message', inputMsg);

      if (selectedUser) {
        const newMessage: Convo = {
          sender: 'You',
          message: inputMsg,
          timestamp: `${dayjs()}`,
        };

        setConv((prevConv) => {
          return prevConv.map((chatUsr) => {
            if (chatUsr.id === selectedUser.id) {
              return {
                ...chatUsr,
                messages: [newMessage, ...chatUsr.messages],
              };
            }
            return chatUsr;
          });
        });

        setSelectedUser((prevSelectedUser) => {
          if (prevSelectedUser) {
            return {
              ...prevSelectedUser,
              messages: [newMessage, ...prevSelectedUser.messages],
            };
          }
          return prevSelectedUser;
        });
      }

      setInputMsg('');
    }
  };

  const createDefaultMessage = () => {
    const newConversation = generate_new_conversation();
    setConv((prevConv) => [newConversation, ...prevConv]);
    setSelectedUser(newConversation);
  };

  function generate_new_conversation() {
    return {
      id: nanoid(),
      name: 'Untitled',
      messages: [
        {
          sender: 'Assistant',
          message:
            "Hello! 👋 I'm here to assist you with anything you need. How can I help you today? 😊",
          timestamp: `${dayjs()}`,
        },
      ],
    };
  }

  return (
    <Layout fixed>
      <Layout.Body className="sm:overflow-hidden">
        <section className="flex h-full gap-6">
          {/* Left Side */}
          <div className="flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80">
            <div className="sticky top-0 z-10 -mx-4 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none">
              <div className="flex items-center justify-between py-2">
                <div className="flex gap-2">
                  <h1 className="text-2xl font-bold">Inbox</h1>
                  <IconMessages size={20} />
                </div>

                <div className="flex items-center justify-end gap-5 py-1">
                  <ThemeSwitch />
                </div>
              </div>

              <Button className="mt-3 w-full gap-2" onClick={createDefaultMessage}>
                New Chat <IconPlus width={18} />
              </Button>
            </div>

            <div className="-mx-3 h-full overflow-auto p-3">
              {conv.length > 0 ? (
                conv.map((chatUsr) => {
                  const { id, messages, name } = chatUsr;
                  const lastConvo = messages[0];
                  const lastMsg =
                    lastConvo?.sender === 'You'
                      ? `You: ${lastConvo?.message}`
                      : lastConvo?.message;

                  return (
                    <Fragment key={id}>
                      <button
                        type="button"
                        className={cn(
                          `-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75`,
                          selectedUser?.id === id && 'sm:bg-muted'
                        )}
                        onClick={() => {
                          setSelectedUser(chatUsr);
                          setMobileSelectedUser(chatUsr);
                        }}
                      >
                        <div className="flex gap-2">
                          <div>
                            <span className="col-start-2 row-span-2 font-medium">
                              Chat: {id}
                            </span>
                            <span className="col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis break-all text-muted-foreground">
                              {lastMsg}
                            </span>
                          </div>
                        </div>
                      </button>
                      <Separator className="my-1" />
                    </Fragment>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground">
                  No conversations yet.
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}
          {selectedUser && (
            <div
              className={cn(
                'absolute inset-0 left-full z-50 flex w-full flex-1 flex-col rounded-md border bg-primary-foreground shadow-sm transition-all duration-200 sm:static sm:z-auto sm:flex',
                mobileSelectedUser && 'left-0'
              )}
            >
              {/* Top Part */}
              <div className="mb-1 flex flex-none justify-between rounded-t-md bg-secondary p-4 shadow-lg">
                {/* Left */}
                <div className="flex gap-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="-ml-2 h-full sm:hidden"
                    onClick={() => setMobileSelectedUser(null)}
                  >
                    <IconArrowLeft />
                  </Button>
                  <div className="flex items-center gap-2 lg:gap-4">
                    <div>
                      <span className="col-start-2 row-span-2 text-sm font-medium lg:text-base">
                        Chat Thread: {selectedUser?.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversation */}
              <div className="flex flex-1 flex-col gap-2 rounded-md px-4 pb-4 pt-0">
                <div className="flex size-full flex-1">
                  <div className="chat-text-container relative -mr-4 flex flex-1 flex-col overflow-y-hidden">
                    <div className="chat-flex flex h-40 w-full flex-grow flex-col-reverse justify-start gap-4 overflow-y-auto py-2 pb-4 pr-4">
                      {currentMessage &&
                        Object.keys(currentMessage).map((key) => (
                          <Fragment key={key}>
                            {currentMessage[key].map((msg, index) => (
                              <div
                                key={`${msg.sender}-${msg.timestamp}-${index}`}
                                className={cn(
                                  'chat-box max-w-72 break-words px-3 py-2 shadow-lg',
                                  msg.sender === 'You'
                                    ? 'self-end rounded-[16px_16px_0_16px] bg-primary/85 text-primary-foreground/75'
                                    : 'self-start rounded-[16px_16px_16px_0] bg-secondary'
                                )}
                              >
                                {msg.message}{' '}
                                <span
                                  className={cn(
                                    'mt-1 block text-xs font-light italic text-muted-foreground',
                                    msg.sender === 'You' && 'text-right'
                                  )}
                                >
                                  {dayjs(msg.timestamp).format('h:mm a')}
                                </span>
                              </div>
                            ))}
                            <div className="text-center text-xs">{key}</div>
                          </Fragment>
                        ))}
                    </div>
                  </div>
                </div>
                <form
                  className="flex w-full flex-none gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                >
                  <div className="flex flex-1 items-center gap-2 rounded-md border border-input px-2 py-1 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring lg:gap-4">
                    <label className="flex-1">
                      <span className="sr-only">Chat Text Box</span>
                      <input
                        value={inputMsg}
                        type="text"
                        placeholder="Type your messages..."
                        className="h-8 w-full bg-inherit focus-visible:outline-none"
                        onChange={(e) => setInputMsg(e.target.value)}
                      />
                    </label>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="hidden sm:inline-flex"
                    >
                      <IconSend size={20} />
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    className="h-full sm:hidden"
                    rightSection={<IconSend size={18} />}
                  >
                    Send
                  </Button>
                </form>
              </div>
            </div>
          )}
        </section>
      </Layout.Body>
    </Layout>
  );
}

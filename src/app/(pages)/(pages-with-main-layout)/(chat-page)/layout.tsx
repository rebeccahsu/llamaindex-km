import ChatHistorySider from "@/app/components/ChatHistorySider";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex w-full h-full">
      <ChatHistorySider />

      <div className="w-[70%] h-[100%] flex flex-col grow p-5">
        {children}
      </div>
    </div>
  );
}

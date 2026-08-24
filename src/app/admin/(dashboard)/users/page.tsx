import { prisma } from "@/lib/prisma";
import { Users, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  // Query all users and include their active sessions
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      sessions: {
        where: {
          expires: {
            gt: new Date(),
          },
        },
      },
    },
  });

  // Calculate unique active users (orang yang sedang login)
  const activeUsersCount = users.filter((u) => u.sessions.length > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-serif tracking-tight text-[#222]">Users</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E6DFD1] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <h3 className="text-3xl font-serif text-[#222] mt-2">{users.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#F0EBE1] flex items-center justify-center">
              <Users className="text-[#677359]" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E6DFD1] rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F9F7F2] rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-500 text-sm font-medium">Currently Online</p>
              <div className="flex items-center space-x-3 mt-2">
                <h3 className="text-3xl font-serif text-[#222]">{activeUsersCount}</h3>
                {activeUsersCount > 0 && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D7C7B2] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#677359]"></span>
                  </span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#F0EBE1] flex items-center justify-center">
              <Activity className="text-[#677359]" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E6DFD1] rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E6DFD1] bg-[#F9F7F2]/50">
          <h2 className="text-lg font-serif font-bold text-[#222]">Users List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-[#F0EBE1]/30 text-xs uppercase text-[#677359]">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DFD1]">
              {users.map((user) => {
                const isOnline = user.sessions.length > 0;
                return (
                  <tr key={user.id} className="hover:bg-[#F9F7F2] transition-colors">
                    <td className="px-6 py-4 text-[#333] font-medium">
                      {user.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4">{user.email || "-"}</td>
                    <td className="px-6 py-4">
                      {isOnline ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F0EBE1] text-[#677359] border border-[#D7C7B2]">
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No Users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

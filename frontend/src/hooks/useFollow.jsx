import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";



const useFollow = () => {
  const queryClient = useQueryClient();
    const { mutate: followUser, isPending } = useMutation({
        mutationFn: async (userId) => {
        try {
            const res = await fetch(`/api/users/follow/${userId}`, {
            method: "POST",
            });
            const data = await res.json();
            if (!res.ok) {
            throw new Error(data.message);
            }
            return data;
        } catch (error) {
            throw new Error(error);
        }
        },
        onSuccess: () => {
            Promise.all([
                queryClient.invalidateQueries(["authUser"]),
                queryClient.invalidateQueries(["suggestedUsers"]),
            ]);
        toast.success("User followed successfully");
        },
        onError: (error) => { 
        toast.error(error.message);
        },
    });
    return { followUser, isPending };
}

export default useFollow
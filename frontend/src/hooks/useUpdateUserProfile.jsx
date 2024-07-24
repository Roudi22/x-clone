import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
	const { mutateAsync:updateProfile, isPending:isUpdatingProfile, isError, error } = useMutation({
		mutationFn: async (formData) => {
			try {
				const res = await fetch(`/api/users/update`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json", //  we are sending json data to the server
					},
					body: JSON.stringify(formData),
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: (data) => { 
			toast.success("Profile updated successfully");
			Promise.all(
				[queryClient.invalidateQueries({queryKey:["userProfile"]}), queryClient.invalidateQueries({queryKey: ["authUser"]})]
			)
			navigate(`/profile/${data.user.username}`);
		},
	});
    return { updateProfile, isUpdatingProfile, isError, error };
};

export default useUpdateUserProfile;
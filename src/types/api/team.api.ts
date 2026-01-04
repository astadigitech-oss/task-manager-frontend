// import { ApiResponse,  } from "./user.api";
// import { UserApi } from "./user.api";

// // ============ MEMBERS ============
// export interface MemberRequest {
//     user_id: number;
//     workspace_id: number;
//     role: Role;
// }

// export interface MemberApi extends UserApi {
//     id: number;
//     user_id: number;
//     workspace_id: number;
//     project_id: number;
//     role: Role;
//     division: string;
//     joinedAt: string;
//     user: UserApi;
// }

// export interface MemberResponse {
//     code: number;
//     success: boolean;
//     message: string;
//     data: {
//         data: MemberApi;
//         user_id: number;
//     }
// }

// export type MemberListResponse = ApiResponse<MemberApi[]>;
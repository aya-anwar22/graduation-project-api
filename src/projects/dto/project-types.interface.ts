// في project-types.interface.ts
export interface PopulatedTeamMember {
  _id: any; // ✅ غيرها من Types.ObjectId
  team_id: any;
  role: string;
  role_description?: string;
  university_number?: string;
  contact_email?: string;
  user_id: {
    _id: any;
    name: string;
    email: string;
    profileImage?: string;
  };
}

export interface PopulatedFile {
  _id: any; // ✅ غيرها من Types.ObjectId
  filename: string;
  filepath: string;
  fileSize: number;
  cloudinary_public_id?: string;
  uploaded_by: {
    _id: any;
    name: string;
    email: string;
  };
  createdAt: Date;
}

export interface PopulatedTeam {
  _id: any;
  name: string;
  code: string;
  project_id: any;
  lead_id: {
    _id: any;
    name: string;
    email: string;
    profileImage?: string;
  };
}

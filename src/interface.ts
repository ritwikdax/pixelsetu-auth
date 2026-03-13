export interface GoogleTokenClaims {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}



interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends Entity {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  isVerified: boolean;

  //Org related fields
  namespace?: string;
  orgDisplayName?: string;
  address?: string;
  phone?: string;
  isOrgOwner?: boolean;
  businessEmail?: string;
  website?: string;
  logoUrl?: string;
  logoUrlDark?: string; // For dark mode

  //App config level
  applicationPool?: Array<string>;
}






export type Collections =
  | "employees"
  | "clients"
  | "projects"
  | "deliverables"
  | "projectDeliverables";

export type BookingType =
  | "wedding"
  | "pre_wedding"
  | "post_wedding"
  | "anniversary"
  | "birthday"
  | "corporate_shoot"
  | "baby_bump"
  | "rice_cereony"
  | "other";
export type LeadType =
  | "facebook"
  | "instagram"
  | "whatsapp"
  | "friends"
  | "wordofmouth"
  | "referrel"
  | "other";
export type ProjectStatus = "open" | "close" | "reopen" | "withdrawn";

export type UpdateType =
  | "info"
  | "error"
  | "blocker"
  | "success"
  | "failed"
  | "unblocker";
export type DeliverableType =
  | "raw_photos"
  | "raw_videoes"
  | "album"
  | "pendrive"
  | "hard_drive"
  | "teaser"
  | "reels"
  | "edited_photos"
  | "full_video"
  | "other";

export type EmployeeRoleType = "admin" | "manager" | "employee";
export type EmployeeStatusType = "active" | "inactive" | "on_leave";
export type EmploymentType = "full_time" | "part_time" | "freelancer";

export interface Client extends Entity {
  name: string;
  phone: string;
  alternatePhone: string;
  email: string;
  address: string;
  isPremiumClient: boolean;
  additionalDetails?: string;
}

export interface Employee extends Entity {
  name: string;
  doj: Date;
  expertise: Array<string>;
  address: string;
  phone: string;
  alternatePhone: string;
  email: string;
  rating: number;
  employmentType: EmploymentType;
  status: EmployeeStatusType;
  role: EmployeeRoleType;
}

export interface Project extends Entity {
  name: string;
  phone: string;
  alternatePhone: string;
  email: string;
  leadSource: LeadType;
  bookingCategory: BookingType;
  dateOfBooking: Date;
  status: ProjectStatus;
  discussionSummary: string;
  details: string;
  clientId?: string;
}

export interface Update extends Entity {
  title: string;
  description: string;
  type: UpdateType;
}

export interface DeliveryUpdate extends Entity {
  title: string;
  status: "not_started" | "done" | "in_progress";
  lastUpdatedOn: Date;
}

export interface Deliverable extends Entity {
  type: DeliverableType;
  displayName: string;
  additionalDetails: string;
  deliveryTime: number; //In days
  assetType: "physical" | "digital";
  updateTemplates: Array<DeliveryUpdate>;
}

export interface ProjectDeliverable extends Deliverable {
  projectId: string;
  deliverableId: string;
  deliveryUpdates: Array<DeliveryUpdate>;
  isDelivered: boolean;
}

export interface ProjectsDeliverable extends Entity {
  projectId: string;
  deliverableId: string;
  deliveryUpdates: Array<DeliveryUpdate>;
}

export interface Event extends Entity {
  projectId: string;
  date: Date;
  venue: string;
  assignment: string;
  team: Array<{ employeeId: string; isLead: string }>;
  status: "upcoming" | "done";
}

export interface FolderInfo {
  folderId: string;
  folderName: string;
  owner: string;
}

export interface Album extends Entity {
  projectId: string;
  albumName: string;
  folderIds: Array<FolderInfo>;
  isSelectionAllowed: boolean;
  maxSelectionCount: number;
  isSelectionSubmitted?: boolean;
  selectionSubmittedAt: string;
}

export interface SelectedImage extends Entity {
  imageId: string;
  folderId: string;
  folderName: string;
  imageFileName: string;
  projectId: string;
  albumId: string;
  note?: string;
}

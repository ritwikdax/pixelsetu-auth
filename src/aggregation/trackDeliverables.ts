import { Document } from "mongodb";

export const trackDeliverablesPipeline: Document[] = [
  {
    $lookup: {
      from: "projects",
      localField: "projectId",
      foreignField: "id",
      as: "projectInfo",
    },
  },
  {
    $lookup: {
      from: "deliverables",
      localField: "deliverableId",
      foreignField: "id",
      as: "deliverableInfo",
    },
  },
  {
    $unwind: "$projectInfo",
  },
  {
    $unwind: "$deliverableInfo",
  },
  {
    $addFields: {
      projectId: "$projectInfo.id",
      projectName: "$projectInfo.name",
      deliverableName: "$deliverableInfo.displayName",
      deliverableType: "$deliverableInfo.type",
      deliveryTime: "$deliverableInfo.deliveryTime",
      assetType: "$deliverableInfo.assetType",
    },
  },
  {
    $project: {
      projectInfo: 0,
      deliverableId: 0,
      deliverableInfo: 0,
    },
  },
  {
    $group: {
      _id: {
        projectName: "$projectName",
        projectId: "$projectId",
      },
      deliverables: {
        $push: {
          deliverableName: "$deliverableName",
          deliverableType: "$deliverableType",
          deliveryTime: "$deliveryTime",
          assetType: "$assetType",
          deliveryUpdates: "$deliveryUpdates",
          isDelivered: "$isDelivered",
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      projectId: "$_id.projectId",
      projectName: "$_id.projectName",
      deliverables: 1,
    },
  },
];

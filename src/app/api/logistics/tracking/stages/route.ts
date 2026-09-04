// import { NextRequest, NextResponse } from "next/server";

// import {
//   getTrackingStages,
//   getAllTrackingStages,
//   upsertTrackingStage,
//   deleteTrackingStage,
// } from "@/lib/tracking";

// import type { TrackingModule } from "@/types/tracking";

// export const runtime = "nodejs";

// /**
//  * GET /api/logistics/tracking/stages
//  * Query params:
//  *   module=LOGISTICS|FOOD   (default LOGISTICS)
//  *   all=true                → include disabled stages (admin view)
//  */
// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const moduleParam = (searchParams.get("module") || "LOGISTICS").toUpperCase();
//     const module: TrackingModule =
//       moduleParam === "FOOD" ? "FOOD" : "LOGISTICS";
//     const includeAll = searchParams.get("all") === "true";

//     const stages = includeAll
//       ? await getAllTrackingStages(module)
//       : await getTrackingStages(module);

//     return NextResponse.json({
//       success: true,
//       module,
//       stages,
//     });
//   } catch (err) {
//     console.error("[tracking/stages GET]", err);
//     return NextResponse.json(
//       {
//         error:
//           err instanceof Error
//             ? err.message
//             : "Failed to fetch tracking stages",
//       },
//       { status: 500 },
//     );
//   }
// }

// /**
//  * POST /api/logistics/tracking/stages
//  * Body: {
//  *   id?: string;          // omit to create
//  *   code: string;
//  *   label: string;
//  *   module?: "LOGISTICS" | "FOOD";
//  *   enabled?: boolean;
//  *   sortOrder?: number;
//  *   isSystem?: boolean;
//  * }
//  */
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     if (!body.code?.trim() || !body.label?.trim()) {
//       return NextResponse.json(
//         { error: "code and label are required." },
//         { status: 400 },
//       );
//     }

//     const module: TrackingModule =
//       body.module === "FOOD" ? "FOOD" : "LOGISTICS";

//     const stage = await upsertTrackingStage({
//       id: body.id,
//       code: body.code,
//       label: body.label,
//       module,
//       enabled: body.enabled !== false,
//       sortOrder:
//         typeof body.sortOrder === "number" ? body.sortOrder : 999,
//       isSystem: Boolean(body.isSystem),
//     });

//     return NextResponse.json({
//       success: true,
//       stage,
//     });
//   } catch (err) {
//     console.error("[tracking/stages POST]", err);
//     return NextResponse.json(
//       {
//         error:
//           err instanceof Error
//             ? err.message
//             : "Failed to save tracking stage",
//       },
//       { status: 500 },
//     );
//   }
// }

// /**
//  * DELETE /api/logistics/tracking/stages
//  * Body: { id: string }
//  * (or query ?id=...)
//  */
// export async function DELETE(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     let id = searchParams.get("id");

//     if (!id) {
//       try {
//         const body = await req.json();
//         id = body?.id;
//       } catch {
//         // no body
//       }
//     }

//     if (!id?.trim()) {
//       return NextResponse.json(
//         { error: "Stage id is required." },
//         { status: 400 },
//       );
//     }

//     await deleteTrackingStage(id.trim());

//     return NextResponse.json({
//       success: true,
//       deleted: id,
//     });
//   } catch (err) {
//     console.error("[tracking/stages DELETE]", err);
//     return NextResponse.json(
//       {
//         error:
//           err instanceof Error
//             ? err.message
//             : "Failed to delete tracking stage",
//       },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";

import {
  getTrackingStages,
  getAllTrackingStages,
  upsertTrackingStage,
  deleteTrackingStage,
} from "@/lib/tracking";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import type { TrackingModule } from "@/types/tracking";

export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function canManageStages(user: { role?: string | null } | null): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") return true;
  try {
    return can(user as Parameters<typeof can>[0], "LOGISTICS_TRACKING_STAGE_MANAGE");
  } catch {
    return false;
  }
}

/**
 * GET /api/logistics/tracking/stages
 * ?module=LOGISTICS|FOOD
 * ?all=true  → include disabled
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleParam = (searchParams.get("module") || "LOGISTICS").toUpperCase();
    const module: TrackingModule =
      moduleParam === "FOOD" ? "FOOD" : "LOGISTICS";
    const includeAll = searchParams.get("all") === "true";

    const stages = includeAll
      ? await getAllTrackingStages(module)
      : await getTrackingStages(module);

    // Shape works with both page parsers:
    // - stagesJson.stages
    // - stagesJson.data / stagesJson.data.stages
    return json({
      success: true,
      module,
      stages,
      data: stages,
    });
  } catch (err) {
    console.error("[tracking/stages GET]", err);
    return json(
      {
        success: false,
        error: {
          code: "STAGES_LOAD_FAILED",
          message:
            err instanceof Error
              ? err.message
              : "Failed to fetch tracking stages",
        },
      },
      500,
    );
  }
}

/**
 * POST — create / upsert one stage
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return json(
        {
          success: false,
          error: { code: "UNAUTHENTICATED", message: "Authentication is required." },
        },
        401,
      );
    }
    if (!canManageStages(user)) {
      return json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only Super Admin / Admin can manage stages.",
          },
        },
        403,
      );
    }

    const body = await req.json();

    if (!body.code?.trim() || !body.label?.trim()) {
      return json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "code and label are required." },
        },
        400,
      );
    }

    const module: TrackingModule =
      body.module === "FOOD" ? "FOOD" : "LOGISTICS";

    const stage = await upsertTrackingStage({
      id: body.id,
      code: body.code,
      label: body.label,
      module,
      enabled: body.enabled !== false,
      sortOrder:
        typeof body.sortOrder === "number" ? body.sortOrder : 999,
      isSystem: Boolean(body.isSystem),
    });

    return json({ success: true, stage, data: stage });
  } catch (err) {
    console.error("[tracking/stages POST]", err);
    return json(
      {
        success: false,
        error: {
          code: "STAGE_SAVE_FAILED",
          message:
            err instanceof Error
              ? err.message
              : "Failed to save tracking stage",
        },
      },
      500,
    );
  }
}

/**
 * PUT — save full stages list from Configure Stages UI
 * Body: { stages: Array<{ trackingStageId?, id?, code, label, enabled?, order? }> }
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return json(
        {
          success: false,
          error: { code: "UNAUTHENTICATED", message: "Authentication is required." },
        },
        401,
      );
    }
    if (!canManageStages(user)) {
      return json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only Super Admin / Admin can configure stages.",
          },
        },
        403,
      );
    }

    const body = await req.json();
    const list = Array.isArray(body.stages) ? body.stages : [];

    if (list.length === 0) {
      return json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "stages array is required.",
          },
        },
        400,
      );
    }

    const module: TrackingModule =
      body.module === "FOOD" ? "FOOD" : "LOGISTICS";

    const saved = [];

    for (let i = 0; i < list.length; i++) {
      const s = list[i] || {};
      const code = String(s.code || "").trim();
      const label = String(s.label || s.code || "").trim();

      if (!code || !label) continue;

      const stage = await upsertTrackingStage({
        id: s.trackingStageId || s.id,
        code,
        label,
        module,
        enabled: s.enabled !== false,
        sortOrder:
          typeof s.order === "number"
            ? s.order
            : typeof s.sortOrder === "number"
              ? s.sortOrder
              : i + 1,
        isSystem: Boolean(s.isSystem),
      });
      saved.push(stage);
    }

    return json({
      success: true,
      message: "Stages saved.",
      stages: saved,
      data: { stages: saved },
    });
  } catch (err) {
    console.error("[tracking/stages PUT]", err);
    return json(
      {
        success: false,
        error: {
          code: "STAGES_SAVE_FAILED",
          message:
            err instanceof Error ? err.message : "Failed to save stages",
        },
      },
      500,
    );
  }
}

/**
 * DELETE — remove one stage
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return json(
        {
          success: false,
          error: { code: "UNAUTHENTICATED", message: "Authentication is required." },
        },
        401,
      );
    }
    if (!canManageStages(user)) {
      return json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only Super Admin / Admin can delete stages.",
          },
        },
        403,
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // no body
      }
    }

    if (!id?.trim()) {
      return json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Stage id is required." },
        },
        400,
      );
    }

    await deleteTrackingStage(id.trim());

    return json({ success: true, deleted: id });
  } catch (err) {
    console.error("[tracking/stages DELETE]", err);
    return json(
      {
        success: false,
        error: {
          code: "STAGE_DELETE_FAILED",
          message:
            err instanceof Error
              ? err.message
              : "Failed to delete tracking stage",
        },
      },
      500,
    );
  }
}
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Crear cliente admin para operaciones de base de datos
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

// GET: Verificar si existe un registro de padre
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("🔄 Verificando registro de padre para usuario:", userId);

    // Buscar registro de padre en la base de datos
    const { data: parent, error } = await supabaseAdmin
      .from("parent")
      .select("*")
      .eq("parentid", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No se encontró registro
        console.log(
          "❌ No se encontró registro de padre para usuario:",
          userId
        );
        return NextResponse.json({ exists: false, parent: null });
      } else {
        console.error("❌ Error buscando registro de padre:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    console.log("✅ Registro de padre encontrado:", parent);
    return NextResponse.json({ exists: true, parent });
  } catch (error) {
    console.error("❌ Error en GET /api/parent-info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo registro de padre
export async function POST(request: Request) {
  try {
    const { userId, firstName, lastName, email, phone } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("🔄 Creando registro de padre para usuario:", userId);

    // Verificar si ya existe un registro
    const { data: existingParent, error: checkError } = await supabaseAdmin
      .from("parent")
      .select("*")
      .eq("parentid", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("❌ Error verificando registro existente:", checkError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (existingParent) {
      console.log("✅ Registro de padre ya existe:", existingParent);
      return NextResponse.json({
        message: "Parent record already exists",
        parent: existingParent,
      });
    }

    // Crear nuevo registro de padre
    const { data: newParent, error: createError } = await supabaseAdmin
      .from("parent")
      .insert({
        parentid: userId,
        firstname: firstName || "",
        lastname: lastName || "",
        email: email || "",
        phone: phone || "",
      })
      .select()
      .single();

    if (createError) {
      console.error("❌ Error creando registro de padre:", createError);
      return NextResponse.json(
        { error: "Failed to create parent record" },
        { status: 500 }
      );
    }

    console.log("✅ Registro de padre creado exitosamente:", newParent);
    return NextResponse.json({
      message: "Parent record created successfully",
      parent: newParent,
    });
  } catch (error) {
    console.error("❌ Error en POST /api/parent-info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar un registro de padre existente
export async function PUT(request: Request) {
  try {
    const { userId, firstName, lastName, email, phone } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("🔄 Actualizando registro de padre para usuario:", userId);

    // Verificar si existe el registro
    const { data: existingParent, error: checkError } = await supabaseAdmin
      .from("parent")
      .select("*")
      .eq("parentid", userId)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        // No existe el registro, crearlo
        console.log("🔄 Registro no existe, creando nuevo registro de padre");
        const { data: newParent, error: createError } = await supabaseAdmin
          .from("parent")
          .insert({
            parentid: userId,
            firstname: firstName || "",
            lastname: lastName || "",
            email: email || "",
            phone: phone || "",
          })
          .select()
          .single();

        if (createError) {
          console.error("❌ Error creando registro de padre:", createError);
          return NextResponse.json(
            { error: "Failed to create parent record" },
            { status: 500 }
          );
        }

        console.log("✅ Registro de padre creado exitosamente:", newParent);
        return NextResponse.json({
          message: "Parent record created successfully",
          parent: newParent,
        });
      } else {
        console.error("❌ Error verificando registro existente:", checkError);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    // Actualizar registro existente
    const { data: updatedParent, error: updateError } = await supabaseAdmin
      .from("parent")
      .update({
        firstname: firstName || "",
        lastname: lastName || "",
        email: email || "",
        phone: phone || "",
      })
      .eq("parentid", userId)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error actualizando registro de padre:", updateError);
      return NextResponse.json(
        { error: "Failed to update parent record" },
        { status: 500 }
      );
    }

    console.log(
      "✅ Registro de padre actualizado exitosamente:",
      updatedParent
    );
    return NextResponse.json({
      message: "Parent record updated successfully",
      parent: updatedParent,
    });
  } catch (error) {
    console.error("❌ Error en PUT /api/parent-info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

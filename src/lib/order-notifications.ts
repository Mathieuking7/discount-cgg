import { supabase } from "@/integrations/supabase/client";

export interface UpdateOrderStatusResult {
  success: boolean;
  error?: string;
  emailSkipped?: boolean;
}

/**
 * Updates a guest order's status and triggers the appropriate notification email.
 *
 * Usage from admin pages (e.g. GuestOrderDetail):
 *   import { updateOrderStatus } from "@/lib/order-notifications";
 *   await updateOrderStatus(order.id, "documents_valides");
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  additionalData?: Record<string, any>
): Promise<UpdateOrderStatusResult> {
  try {
    // 1. Read current status before updating
    const { data: current, error: fetchError } = await supabase
      .from("guest_orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (fetchError) {
      return { success: false, error: `Failed to fetch order: ${fetchError.message}` };
    }

    const oldStatus = current?.status;

    // 2. Update guest_orders status
    const { error: updateError } = await supabase
      .from("guest_orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (updateError) {
      return { success: false, error: `Failed to update status: ${updateError.message}` };
    }

    // 3. Call the order-status-webhook edge function to send notification
    const { data, error: fnError } = await supabase.functions.invoke(
      "order-status-webhook",
      {
        body: {
          order_id: orderId,
          new_status: newStatus,
          old_status: oldStatus,
          additional_data: additionalData,
        },
      }
    );

    if (fnError) {
      // Status was updated successfully but email failed – not a hard failure
      console.error("Email notification failed:", fnError);
      return { success: true, error: `Status updated but email failed: ${fnError.message}` };
    }

    return {
      success: true,
      emailSkipped: data?.skipped === true,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

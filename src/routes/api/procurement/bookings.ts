import { createFileRoute } from "@tanstack/react-router";
import { procurementService } from "@/lib/procurementService.server";

export const Route = createFileRoute("/api/procurement/bookings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const tokenId = url.searchParams.get("tokenId") || url.searchParams.get("id");

          if (tokenId) {
            const booking = procurementService.getBooking(tokenId);
            if (!booking) {
              return Response.json(
                { success: false, message: `Booking with token ${tokenId} not found` },
                { status: 404 }
              );
            }
            return Response.json({ success: true, data: booking, booking });
          }

          const allBookings = procurementService.getAllBookings();
          return Response.json({ success: true, data: allBookings, bookings: allBookings });
        } catch (error: any) {
          return Response.json(
            { success: false, message: error?.message || "Failed to retrieve booking" },
            { status: 500 }
          );
        }
      },

      POST: async ({ request }) => {
        try {
          const body = await request.json();

          // Handle cancellation requests sent via POST
          if (body?.action === "cancel" || body?.cancel === true) {
            const tokenId = body.tokenId || body.bookingId || body.id;
            if (!tokenId) {
              return Response.json(
                { success: false, message: "Token ID is required for cancellation" },
                { status: 400 }
              );
            }
            const cancelled = procurementService.cancelBooking(tokenId);
            if (!cancelled) {
              return Response.json(
                { success: false, message: `Booking ${tokenId} not found or already cancelled` },
                { status: 404 }
              );
            }
            return Response.json({
              success: true,
              message: `Booking ${tokenId} successfully cancelled`,
            });
          }

          // Handle status update via POST
          if (body?.status && body?.tokenId) {
            const updated = procurementService.updateBookingStatus(body.tokenId, body.status);
            if (!updated) {
              return Response.json(
                { success: false, message: `Booking ${body.tokenId} not found` },
                { status: 404 }
              );
            }
            return Response.json({
              success: true,
              message: `Booking ${body.tokenId} updated to ${body.status}`,
              data: procurementService.getBooking(body.tokenId),
            });
          }

          // Create new booking
          const booking = procurementService.createBooking(body);
          return Response.json(
            {
              success: true,
              message: "Gate pass booking created successfully",
              data: booking,
              booking,
            },
            { status: 201 }
          );
        } catch (error: any) {
          return Response.json(
            {
              success: false,
              message: error?.message || "Failed to create procurement booking",
            },
            { status: 500 }
          );
        }
      },

      PATCH: async ({ request }) => {
        try {
          const body = await request.json();
          const tokenId = body.tokenId || body.bookingId || body.id;
          const status = body.status;

          if (!tokenId) {
            return Response.json(
              { success: false, message: "Token ID is required for update" },
              { status: 400 }
            );
          }

          if (status) {
            const updated = procurementService.updateBookingStatus(tokenId, status);
            if (!updated) {
              return Response.json(
                { success: false, message: `Booking ${tokenId} not found` },
                { status: 404 }
              );
            }
            return Response.json({
              success: true,
              message: `Booking ${tokenId} status updated to ${status}`,
              data: procurementService.getBooking(tokenId),
            });
          }

          const cancelled = procurementService.cancelBooking(tokenId);
          if (!cancelled) {
            return Response.json(
              { success: false, message: `Booking ${tokenId} not found` },
              { status: 404 }
            );
          }
          return Response.json({
            success: true,
            message: `Booking ${tokenId} cancelled`,
          });
        } catch (error: any) {
          return Response.json(
            { success: false, message: error?.message || "Failed to update booking" },
            { status: 500 }
          );
        }
      },
    },
  },
});

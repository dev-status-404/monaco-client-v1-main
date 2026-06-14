import { apiEndpoints } from "@/api/api-endpoints";
import api from "@/api/axios"; // Aapka custom axios instance

export const withdrawlsApi = {
  // Backend service ke pagination logic ke mutabiq
  getWithdrawls: async (params: any) => {
    const response = await api.get(apiEndpoints.withdrawal.getAll(params));
    return response.data;
  },

  getPayoutRequests: async (params: any = {}, adminMode = false) => {
    const endpoint = adminMode
      ? apiEndpoints.paymentSystem.adminPayoutRequests(params)
      : apiEndpoints.paymentSystem.myPayoutRequests(params);
    const response = await api.get(endpoint);
    return response.data;
  },

  createWithdrawls: async (data: any) => {
    const method = String(data?.method ?? data?.payment_method ?? "").toLowerCase();
    if (["tierlock", "pixpay"].includes(method)) {
      const phone = String(data?.customerPhone ?? data?.customer_phone ?? data?.phone ?? "").trim();
      const payoutAccount = String(data?.payoutAccount ?? data?.payout_account ?? data?.destination ?? data?.address ?? "").trim();
      const gameName = String(data?.gameName ?? data?.game_name ?? "").trim();
      const gameUsername = String(data?.gameUsername ?? data?.game_username ?? "").trim();

      const response = await api.post(apiEndpoints.paymentSystem.createPayoutRequest, {
        amount: data?.amount,
        game: gameName,
        game_username: gameUsername,
        payout_method: method === "tierlock" ? "Tierlock" : "PixPay",
        payout_account: payoutAccount,
        customer_phone: phone || payoutAccount,
        note: data?.memo ?? data?.note,
      });
      return response.data;
    }

    const normalizedDestination = String(
      data?.address ?? data?.destination ?? "",
    ).trim();
    const normalizedUserId = String(data?.userId ?? data?.user_id ?? "").trim();
    const normalizedGameId = String(data?.gameId ?? data?.game_id ?? "").trim();
    const normalizedGameName = String(
      data?.gameName ?? data?.game_name ?? "",
    ).trim();

    const response = await api.post(apiEndpoints.wallet.withdraw, {
      userId: normalizedUserId,
      amount: data?.amount,
      address: normalizedDestination,
      destination: normalizedDestination,
      method: data?.method ?? "pointsmate",
      currency: data?.currency,
      gameId: normalizedGameId,
      gameName: normalizedGameName,
      memo: data?.memo,
      referenceId: data?.referenceId,
    });
    return response.data;
  },

  updateWithdrawls: async (data: any) => {
    const nextStatus = String(data?.status ?? "").toLowerCase();
    const isPayoutRequest =
      data?.source === "payout" ||
      ["Redeem Requested", "Under Review", "Approved", "Paid Out", "Rejected", "Failed", "Cancelled", "Expired"].includes(
        String(data?.currentStatus ?? data?.current_status ?? data?.statusRaw ?? ""),
      );

    if (isPayoutRequest) {
      const statusMap: Record<string, string> = {
        requested: "Redeem Requested",
        pending: "Redeem Requested",
        processing: "Under Review",
        approved: "Approved",
        paid: "Paid Out",
        completed: "Paid Out",
        confirmed: "Paid Out",
        rejected: "Rejected",
        failed: "Failed",
        cancelled: "Cancelled",
        canceled: "Cancelled",
        expired: "Expired",
      };
      const response = await api.patch(
        apiEndpoints.paymentSystem.updatePayoutStatus(data?.id),
        {
          status: statusMap[nextStatus] ?? data?.status,
          admin_notes: data?.adminNote ?? data?.admin_note,
        },
      );
      return response.data;
    }

    const normalizedDestination = String(
      data?.destination ?? data?.address ?? "",
    ).trim();
    const destinationForApprove =
      normalizedDestination && normalizedDestination !== "-"
        ? normalizedDestination
        : undefined;

    let response;

    if (nextStatus === "approved") {
      const approvePayload = {
        id: data?.id,
        reviewedByAdminId:
          data?.reviewedByAdminId ?? data?.reviewed_by_admin_id,
        adminNote: data?.adminNote ?? data?.admin_note,
        destination: destinationForApprove,
        address: destinationForApprove,
      };

      try {
        response = await api.post(
          apiEndpoints.withdrawal.approve,
          approvePayload,
        );
      } catch (primaryError: any) {
        const code = Number(primaryError?.response?.status || 0);

        if (code === 404 || code === 405) {
          try {
            response = await api.post(
              apiEndpoints.wallet.approveWithdraw,
              approvePayload,
            );
          } catch (secondaryError: any) {
            const secondaryCode = Number(secondaryError?.response?.status || 0);

            if (secondaryCode === 404 || secondaryCode === 405) {
              response = await api.put(apiEndpoints.withdrawal.update, {
                id: data?.id,
                status: "approved",
                reviewed_by_admin_id:
                  data?.reviewedByAdminId ?? data?.reviewed_by_admin_id,
                admin_note: data?.adminNote ?? data?.admin_note,
                destination: destinationForApprove,
                address: destinationForApprove,
              });
            } else {
              throw secondaryError;
            }
          }
        } else {
          throw primaryError;
        }
      }
    } else {
      response = await api.put(apiEndpoints.withdrawal.update, data);
    }

    return response.data;
  },

  deleteWithdrawls: async (id: string | number) => {
    const response = await api.delete(apiEndpoints.withdrawal.delete(id));
    return response.data;
  },

  bulkDeleteWithdrawls: async (ids: (string | number)[]) => {
    // Backend expect kar raha hai ids delete logic mein
    const response = await api.post(apiEndpoints.withdrawal.bulkDelete, {
      data: { ids },
    });
    return response.data;
  },
};

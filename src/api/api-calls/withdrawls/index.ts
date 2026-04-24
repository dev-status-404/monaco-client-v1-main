import { apiEndpoints } from "@/api/api-endpoints";
import api from "@/api/axios"; // Aapka custom axios instance

export const withdrawlsApi = {
  // Backend service ke pagination logic ke mutabiq
  getWithdrawls: async (params: any) => {
    const response = await api.get(
      apiEndpoints.withdrawal.getAll(params),
    );
    return response.data;
  },

  createWithdrawls: async (data: any) => {
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
      amountSats: data?.amountSats,
      address: normalizedDestination,
      destination: normalizedDestination,
      method: "pointsmate",
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
        reviewedByAdminId: data?.reviewedByAdminId ?? data?.reviewed_by_admin_id,
        adminNote: data?.adminNote ?? data?.admin_note,
        destination: destinationForApprove,
        address: destinationForApprove,
      };

      try {
        response = await api.post(apiEndpoints.withdrawal.approve, approvePayload);
      } catch (primaryError: any) {
        const code = Number(primaryError?.response?.status || 0);

        if (code === 404 || code === 405) {
          try {
            response = await api.post(apiEndpoints.wallet.approveWithdraw, approvePayload);
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

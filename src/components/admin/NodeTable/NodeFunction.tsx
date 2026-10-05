import * as React from "react";
import { z } from "zod";
import { schema } from "@/components/admin/NodeTable/schema/node";
import { DataTableRefreshContext } from "@/components/admin/NodeTable/schema/DataTableRefreshContext";
import { Trash2, Copy, Download, DollarSign } from "lucide-react";
import { t } from "i18next";
import type { Row } from "@tanstack/react-table";
import { EditDialog } from "./NodeEditDialog";
import { quoteShellArgs } from "@/utils/shellQuote";
import {
  Button,
  Checkbox,
  Dialog,
  Flex,
  IconButton,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { toast } from "sonner";

async function removeClient(uuid: string) {
  await fetch(`/api/admin/client/${uuid}/remove`, {
    method: "POST",
  });
}

type InstallOptions = {
  ignoreUnsafeCert: boolean;
  dir: string;
  serviceName: string;
};

export function ActionsCell({ row }: { row: Row<z.infer<typeof schema>> }) {
  const refreshTable = React.useContext(DataTableRefreshContext);
  const [removing, setRemoving] = React.useState(false);
  const [installOptions, setInstallOptions] = React.useState<InstallOptions>({
    ignoreUnsafeCert: false,
    dir: "",
    serviceName: "",
  });

  const generateCommand = () => {
    const host = window.location.origin;
    const token = row.original.token ?? "";
    const args: string[] = ["-e", host, "-t", token];
    // 根据安装选项生成参数
    if (installOptions.ignoreUnsafeCert) {
      args.push("--ignore-unsafe-cert");
    }
    const installDir = installOptions.dir.trim();
    if (installDir) {
      args.push(`--install-dir`);
      args.push(installDir);
    }
    const serviceName = installOptions.serviceName.trim();
    if (serviceName) {
      args.push(`--install-service-name`);
      args.push(serviceName);
    }

    return (
      `wget -qO- https://raw.githubusercontent.com/wander44-svg/komari-agent/refs/heads/komari-optimal/install.sh | sudo bash -s -- ` +
      quoteShellArgs(args)
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "0";
        textarea.style.left = "0";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        try {
          if (!document.execCommand("copy")) {
            throw new Error("Clipboard copy was rejected");
          }
        } finally {
          textarea.remove();
        }
      }
      toast.success(t("copy_success", "已复制到剪贴板"));
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error(t("copy_failed", "复制失败"));
    }
  };

  return (
    <div className="km-node-function flex gap-3 justify-center">
      <Dialog.Root>
        <Dialog.Trigger>
          <IconButton
            variant="ghost"
            title={t("admin.nodeTable.installCommand", "Install command")}
            aria-label={t("admin.nodeTable.installCommand", "Install command")}
          >
            <Download className="p-1" />
          </IconButton>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>
            {t("admin.nodeTable.installCommand", "一键部署指令")}
          </Dialog.Title>
          <div className="flex flex-col gap-4">
            <Flex direction="column" gap="2">
              <label className="text-base font-bold">
                {t("admin.nodeTable.installOptions", "安装选项")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Flex gap="2">
                  <Checkbox
                    checked={installOptions.ignoreUnsafeCert}
                    onCheckedChange={(checked) => {
                      setInstallOptions((prev) => ({
                        ...prev,
                        ignoreUnsafeCert: Boolean(checked),
                      }));
                    }}
                  />
                  <label
                    className="text-sm font-normal"
                    onClick={() => {
                      setInstallOptions((prev) => ({
                        ...prev,
                        ignoreUnsafeCert: !prev.ignoreUnsafeCert,
                      }));
                    }}
                  >
                    {t("admin.nodeTable.ignoreUnsafeCert", "忽略不安全证书")}
                  </label>
                </Flex>
              </div>
              <Flex direction="column" gap="2">
                <label className="text-sm font-normal">
                  {t("admin.nodeTable.install_dir", "安装目录")}
                </label>
                <TextField.Root
                  placeholder={t(
                    "admin.nodeTable.install_dir_placeholder",
                    "安装目录，为空则使用默认目录(/opt/komari-agent)"
                  )}
                  onChange={(e) =>
                    setInstallOptions((prev) => ({
                      ...prev,
                      dir: e.target.value,
                    }))
                  }
                ></TextField.Root>
                <label className="text-sm font-normal">
                  {t("admin.nodeTable.serviceName", "服务名称")}
                </label>
                <TextField.Root
                  placeholder={t(
                    "admin.nodeTable.serviceName_placeholder",
                    "服务名称，为空则使用默认名称(komari-agent)"
                  )}
                  onChange={(e) =>
                    setInstallOptions((prev) => ({
                      ...prev,
                      serviceName: e.target.value,
                    }))
                  }
                ></TextField.Root>
              </Flex>
            </Flex>
            <Flex direction="column" gap="2">
              <label className="text-base font-bold">
                {t("admin.nodeTable.generatedCommand", "生成的指令")}
              </label>
              <div className="relative">
                <TextArea
                  disabled
                  className="w-full"
                  style={{ minHeight: "80px" }}
                  value={generateCommand()}
                />
              </div>
            </Flex>
            <Flex justify="center">
              <Button
                style={{ width: "100%" }}
                onClick={() => copyToClipboard(generateCommand())}
              >
                <Copy size={16} />
                {t("common.copy")}
              </Button>
            </Flex>
          </div>
        </Dialog.Content>
      </Dialog.Root>
      {/** Edit Button */}
      <EditDialog item={row.original} />
      {/** Edit Money */}
      <Dialog.Root> 
        <Dialog.Trigger>
          <IconButton
            variant="ghost"
            title={t("admin.nodeTable.editNodePrice", "Edit Price")}
            aria-label={t("admin.nodeTable.editNodePrice", "Edit Price")}
          >
           <DollarSign className="p-1" />
          </IconButton>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>{t("admin.nodeTable.editNodePrice")}</Dialog.Title>
          <label>
            123
          </label>
        </Dialog.Content>
      </Dialog.Root>
      {/** Delete Button */}
      <Dialog.Root>
        <Dialog.Trigger>
          <IconButton
            variant="ghost"
            color="red"
            className="text-destructive"
            title={t("common.delete", "Delete")}
            aria-label={t("common.delete", "Delete")}
          >
            <Trash2 className="p-1" />
          </IconButton>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>{t("common.confirm_delete")}</Dialog.Title>
          <Dialog.Description>
            {t("admin.nodeTable.cannotUndo")}
          </Dialog.Description>
          <Flex gap="2" justify={"end"}>
            <Dialog.Close>
              <Button variant="soft">{t("common.cancel")}</Button>
            </Dialog.Close>
            <Dialog.Trigger>
              <Button
                disabled={removing}
                color="red"
                onClick={async () => {
                  setRemoving(true);
                  await removeClient(row.original.uuid);
                  setRemoving(false);
                  if (refreshTable) refreshTable();
                }}
              >
                {removing
                  ? t("admin.nodeTable.deleting")
                  : t("common.confirm")}
              </Button>
            </Dialog.Trigger>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}

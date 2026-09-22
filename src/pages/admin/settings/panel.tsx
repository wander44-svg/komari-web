import React from "react";
import { Button, Flex, TextField } from "@radix-ui/themes";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  SettingCard,
  SettingCardLabel,
} from "@/components/admin/SettingCard";
import { updateSettingsWithToast, useSettings } from "@/lib/api";

const PanelSettings = () => {
  const { t } = useTranslation();
  const { settings, loading, error } = useSettings();
  const [port, setPort] = React.useState("");
  const [certFile, setCertFile] = React.useState("");
  const [keyFile, setKeyFile] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (loading) return;
    setPort(String(settings.panel_listen_port ?? 25774));
    setCertFile(String(settings.panel_tls_cert_file ?? ""));
    setKeyFile(String(settings.panel_tls_key_file ?? ""));
  }, [loading, settings]);

  const saveAll = async () => {
    const next = Number(port);
    if (!Number.isInteger(next) || next < 1 || next > 65535) {
      toast.error(t("settings.panel.invalid_port"));
      return;
    }
    const cert = certFile.trim();
    const key = keyFile.trim();
    if ((cert === "") !== (key === "")) {
      toast.error(t("settings.panel.tls_pair_required"));
      return;
    }
    setSaving(true);
    try {
      await updateSettingsWithToast(
        {
          panel_listen_port: next,
          panel_tls_cert_file: cert,
          panel_tls_key_file: key,
        },
        t,
      );
    } catch {
      // updateSettingsWithToast already displays the error.
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;
  if (error) return <div className="text-red-9">{error}</div>;

  return (
    <Flex direction="column" gap="3">
      <SettingCardLabel>{t("settings.panel.title")}</SettingCardLabel>
      <SettingCard
        title={t("settings.panel.listen_port")}
        description={t("settings.panel.listen_port_description")}
      >
        <Flex direction="column" gap="2" className="w-full mt-1">
          <TextField.Root
            type="number"
            min={1}
            max={65535}
            value={port}
            onChange={(event) => setPort(event.target.value)}
            disabled={saving}
          />
        </Flex>
      </SettingCard>
      <SettingCard
        title={t("settings.panel.tls_title")}
        description={t("settings.panel.tls_description")}
      >
        <Flex direction="column" gap="3" className="w-full mt-1">
          <Flex direction="column" gap="1" className="w-full">
            <label className="text-sm font-medium">
              {t("settings.panel.cert_file")}
            </label>
            <TextField.Root
              value={certFile}
              placeholder="/etc/komari/panel.crt"
              onChange={(event) => setCertFile(event.target.value)}
              disabled={saving}
            />
          </Flex>
          <Flex direction="column" gap="1" className="w-full">
            <label className="text-sm font-medium">
              {t("settings.panel.key_file")}
            </label>
            <TextField.Root
              value={keyFile}
              placeholder="/etc/komari/panel.key"
              onChange={(event) => setKeyFile(event.target.value)}
              disabled={saving}
            />
          </Flex>
        </Flex>
      </SettingCard>
      <Flex justify="end">
        <Button onClick={saveAll} disabled={saving}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </Flex>
    </Flex>
  );
};

export default PanelSettings;

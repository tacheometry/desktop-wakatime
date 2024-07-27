import { useCallback, useEffect, useState } from "react";
import {
  DomainPreferenceType,
  FilterType,
  IpcKeys,
} from "electron/utils/constants";
import { useDebounceCallback } from "usehooks-ts";

import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { useAppVersion } from "~/utils/queries";

export function Component() {
  const [apiKey, setApiKey] = useState(
    () => window.ipcRenderer.getSetting("settings", "api_key") ?? "",
  );
  const [logFilePath] = useState(
    () => window.ipcRenderer.sendSync(IpcKeys.logFilePath) as string,
  );
  const [shouldLogToFile, setShouldLogToFile] = useState(() =>
    window.ipcRenderer.shouldLogToFile(),
  );
  const [shouldLaunchOnLogIn, setShouldLaunchOnLogIn] = useState(() =>
    window.ipcRenderer.shouldLaunchOnLogIn(),
  );
  const [isBrowserMonitored] = useState(
    () => window.ipcRenderer.sendSync(IpcKeys.isBrowserMonitored) as boolean,
  );
  const [domainPreference, setDomainPreference] = useState(
    () =>
      window.ipcRenderer.sendSync(
        IpcKeys.getDomainPreference,
      ) as DomainPreferenceType,
  );
  const [filterType, setFilterType] = useState(
    () => window.ipcRenderer.sendSync(IpcKeys.getFilterType) as FilterType,
  );
  const [denylist, setDenylist] = useState(
    () => window.ipcRenderer.sendSync(IpcKeys.getDenylist) as string,
  );
  const [allowlist, setAllowlist] = useState(
    () => window.ipcRenderer.sendSync(IpcKeys.getAllowlist) as string,
  );
  const appVersionQuery = useAppVersion();

  const debouncedSetApiKey = useDebounceCallback((apiKey: string) => {
    window.ipcRenderer.setSetting("settings", "api_key", apiKey);
    setApiKey(apiKey);
  }, 200);
  const debouncedSetDenylist = useDebounceCallback((value: string) => {
    window.ipcRenderer.send(IpcKeys.setDenylist, value);
    setDenylist(value);
  }, 200);
  const debouncedSetAllowlist = useDebounceCallback((value: string) => {
    window.ipcRenderer.send(IpcKeys.setAllowlist, value);
    setAllowlist(value);
  }, 200);

  const handleShouldLogToFileChange = useCallback((value: boolean) => {
    window.ipcRenderer.setShouldLogToFile(value);
    setShouldLogToFile(value);
  }, []);

  const handleShouldLaunchOnLogInChange = useCallback((value: boolean) => {
    window.ipcRenderer.setShouldLaunchOnLogIn(value);
    setShouldLaunchOnLogIn(value);
  }, []);

  const handleDomainPreferenceChange = useCallback(
    (value: DomainPreferenceType) => {
      window.ipcRenderer.send(IpcKeys.setDomainPreference, value);
      setDomainPreference(value);
    },
    [],
  );
  const handleFilterTypeChange = useCallback((value: FilterType) => {
    window.ipcRenderer.send(IpcKeys.setFilterType, value);
    setFilterType(value);
  }, []);

  useEffect(() => {
    window.document.title = "Settings";
  }, []);

  return (
    <div className="flex flex-1 flex-col space-y-6 p-4">
      <div>
        <fieldset className="flex flex-col gap-2">
          <Label htmlFor="wakatime-api-key">Wakatime API Key:</Label>
          <Input
            id="wakatime-api-key"
            defaultValue={apiKey}
            onChange={(e) => {
              debouncedSetApiKey(e.target.value);
            }}
          />
        </fieldset>
      </div>
      <div className="space-y-2">
        <fieldset className="flex gap-2">
          <Checkbox
            id="launch-at-login"
            className="mt-1"
            checked={shouldLaunchOnLogIn}
            onCheckedChange={(checked) => {
              handleShouldLaunchOnLogInChange(checked === true);
            }}
          />
          <Label htmlFor="launch-at-login" className="my-0.5 leading-5">
            Launch at login
          </Label>
        </fieldset>
        <fieldset className="flex gap-2">
          <Checkbox
            id="enable-logging"
            checked={shouldLogToFile}
            onCheckedChange={(checked) => {
              handleShouldLogToFileChange(checked === true);
            }}
            className="mt-1"
          />
          <Label htmlFor="enable-logging" className="my-0.5 leading-5">
            Enable logging to <code>{logFilePath}</code>
          </Label>
        </fieldset>
      </div>
      {isBrowserMonitored && (
        <div className="space-y-6">
          <p>
            The settings below are only applicable because you’ve enabled
            monitoring a browser in the Monitored Apps menu.
          </p>
          <div>
            <fieldset className="space-y-1">
              <Label>Browser Tracking:</Label>
              <Tabs value={domainPreference}>
                <TabsList>
                  <TabsTrigger
                    value={DomainPreferenceType.domain}
                    onClick={() =>
                      handleDomainPreferenceChange(DomainPreferenceType.domain)
                    }
                  >
                    Domain Only
                  </TabsTrigger>
                  <TabsTrigger
                    value={DomainPreferenceType.url}
                    onClick={() =>
                      handleDomainPreferenceChange(DomainPreferenceType.url)
                    }
                  >
                    Full url
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </fieldset>
          </div>
          <div>
            <fieldset className="space-y-1">
              <Label>Browser Filter:</Label>
              <Tabs value={filterType}>
                <TabsList>
                  <TabsTrigger
                    value={FilterType.denylist}
                    onClick={() => handleFilterTypeChange(FilterType.denylist)}
                  >
                    All except denied sites
                  </TabsTrigger>
                  <TabsTrigger
                    value={FilterType.allowlist}
                    onClick={() => handleFilterTypeChange(FilterType.allowlist)}
                  >
                    Only allowed sites
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="denylist">
                  <fieldset className="space-y-1">
                    <Label>Denylist</Label>
                    <Textarea
                      defaultValue={denylist}
                      onChange={(e) =>
                        debouncedSetDenylist(e.currentTarget.value)
                      }
                      className="resize-none"
                      rows={6}
                    />
                    <p className="text-sm text-muted-foreground">
                      Sites that you don't want to show in your reports. Only
                      applicable to browsing activity. One regex per line.
                    </p>
                  </fieldset>
                </TabsContent>
                <TabsContent value="allowlist">
                  <fieldset className="space-y-1">
                    <Label>Allowlist</Label>
                    <Textarea
                      defaultValue={allowlist}
                      onChange={(e) =>
                        debouncedSetAllowlist(e.currentTarget.value)
                      }
                      className="resize-none"
                      rows={6}
                    />
                    <p className="text-sm text-muted-foreground">
                      Sites that you want to show in your reports. Only
                      applicable to browsing activity. One regex per line.
                    </p>
                  </fieldset>
                </TabsContent>
              </Tabs>
            </fieldset>
          </div>
        </div>
      )}
      <div className="flex-1"></div>
      <div>
        <p className="text-sm text-muted-foreground">
          Version:{" "}
          {appVersionQuery.isPending
            ? "Loading..."
            : appVersionQuery.isError
              ? appVersionQuery.error.message
              : appVersionQuery.data}
        </p>
      </div>
    </div>
  );
}

"use client";

import { ArrowLeftIcon, BotIcon, SaveIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAgent, useUpdateAgent } from "@/core/agents";
import { useI18n } from "@/core/i18n/hooks";

function listToText(value: string[] | null | undefined) {
  return value?.join("\n") ?? "";
}

function textToList(
  value: string,
  originalValue?: string[] | null,
): string[] | null {
  const items = value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (items.length > 0) return items;
  return originalValue?.length === 0 ? [] : null;
}

export default function EditAgentPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { agent_name } = useParams<{ agent_name: string }>();
  const decodedAgentName = useMemo(
    () => decodeURIComponent(agent_name),
    [agent_name],
  );

  const { agent, isLoading, error } = useAgent(decodedAgentName);
  const updateAgent = useUpdateAgent();

  const [description, setDescription] = useState("");
  const [model, setModel] = useState("");
  const [toolGroups, setToolGroups] = useState("");
  const [skills, setSkills] = useState("");
  const [soul, setSoul] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (!agent || hasHydrated) return;
    setDescription(agent.description ?? "");
    setModel(agent.model ?? "");
    setToolGroups(listToText(agent.tool_groups));
    setSkills(listToText(agent.skills));
    setSoul(agent.soul ?? "");
    setHasHydrated(true);
  }, [agent, hasHydrated]);

  async function handleSave() {
    if (!agent) return;

    try {
      await updateAgent.mutateAsync({
        name: agent.name,
        request: {
          description: description.trim(),
          model: model.trim() || null,
          tool_groups: textToList(toolGroups, agent.tool_groups),
          skills: textToList(skills, agent.skills),
          soul,
        },
      });
      toast.success(t.agents.editSaveSuccess);
      router.push("/workspace/agents");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="flex size-full flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/workspace/agents")}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div className="flex min-w-0 items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <BotIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold">
                {t.agents.editPageTitle}
              </h1>
              <p className="text-muted-foreground truncate text-xs">
                {decodedAgentName}
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={() => void handleSave()}
          disabled={!agent || updateAgent.isPending}
        >
          <SaveIcon className="mr-1.5 h-4 w-4" />
          {updateAgent.isPending ? t.agents.editSaving : t.common.save}
        </Button>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {isLoading ? (
            <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
              {t.common.loading}
            </div>
          ) : error || !agent ? (
            <Alert variant="destructive">
              <AlertDescription>{t.agents.editLoadError}</AlertDescription>
            </Alert>
          ) : (
            <>
              <section className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      {t.agents.editNameLabel}
                    </span>
                    <Input value={agent.name} disabled />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      {t.agents.editModelLabel}
                    </span>
                    <Input
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder={t.agents.editModelPlaceholder}
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    {t.agents.editDescriptionLabel}
                  </span>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t.agents.editDescriptionPlaceholder}
                    className="min-h-24 resize-y"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      {t.agents.editToolGroupsLabel}
                    </span>
                    <Textarea
                      value={toolGroups}
                      onChange={(e) => setToolGroups(e.target.value)}
                      placeholder={t.agents.editListPlaceholder}
                      className="min-h-28 resize-y"
                    />
                    <p className="text-muted-foreground text-xs">
                      {t.agents.editListHint}
                    </p>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      {t.agents.editSkillsLabel}
                    </span>
                    <Textarea
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder={t.agents.editListPlaceholder}
                      className="min-h-28 resize-y"
                    />
                    <p className="text-muted-foreground text-xs">
                      {t.agents.editListHint}
                    </p>
                  </label>
                </div>
              </section>

              <section className="space-y-2">
                <div>
                  <h2 className="text-sm font-semibold">
                    {t.agents.editSoulLabel}
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {t.agents.editSoulHint}
                  </p>
                </div>
                <Textarea
                  value={soul}
                  onChange={(e) => setSoul(e.target.value)}
                  placeholder={t.agents.editSoulPlaceholder}
                  className="min-h-96 resize-y font-mono text-sm"
                />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

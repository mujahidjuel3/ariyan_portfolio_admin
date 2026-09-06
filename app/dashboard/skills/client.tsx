"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, LoadingState, PageHeader } from "@/components/ui";
import { useCreateSkill, useDeleteSkill, useSkills, useUpdateSkill } from "@/hooks/useSkills";

export default function SkillsPage() {
  const { data, isLoading } = useSkills();
  const create = useCreateSkill();
  const update = useUpdateSkill();
  const remove = useDeleteSkill();
  const [newSkill, setNewSkill] = useState("");

  if (isLoading || !data) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Skills" description="Hero ticker skill labels." />
      <Card className="mb-4 flex gap-2">
        <Input placeholder="New skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} />
        <Button onClick={() => { if (newSkill) { void create.mutateAsync({ name: newSkill }).then(() => setNewSkill("")); } }}><Plus className="size-4" /> Add</Button>
      </Card>
      <div className="space-y-2">
        {data.map((skill) => (
          <Card key={skill.id} className="flex items-center gap-2">
            <Input defaultValue={skill.name} onBlur={(e) => update.mutate({ id: skill.id, payload: { name: e.target.value } })} />
            <Button variant="ghost" className="text-red-600" onClick={() => remove.mutate(skill.id)}><Trash2 className="size-4" /></Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { api } from "@/shared/api/client";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

const createGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Group name is required")
    .max(100, "Group name is too long"),
  description: z.string().optional(),
  words: z
    .array(
      z.object({
        english: z.string().min(1, "English word is required"),
        russian: z.string().min(1, "Russian translation is required"),
        description: z.string().optional(),
      }),
    )
    .min(1, "Add at least one word"),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

interface AddGroupModalProps {
  children: React.ReactNode;
}

const STORAGE_KEY = "add-group-form-draft";

const getDefaultValues = (): CreateGroupForm => ({
  name: "",
  description: "",
  words: [{ english: "", russian: "", description: "" }],
});

const loadFormFromStorage = (): CreateGroupForm => {
  if (typeof window === "undefined") return getDefaultValues();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        parsed.name ||
        parsed.description ||
        parsed.words.some(
          (word: { english?: string; russian?: string }) =>
            word.english || word.russian,
        )
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Error loading form draft:", error);
  }

  return getDefaultValues();
};

const saveFormToStorage = (data: CreateGroupForm) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Error saving form draft:", error);
  }
};

const clearFormFromStorage = () => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Error clearing form draft:", error);
  }
};

export function AddGroupModal({ children }: AddGroupModalProps) {
  const [open, setOpen] = useState(false);
  const [isFormRestored, setIsFormRestored] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "words",
  });

  const formData = watch();

  useEffect(() => {
    if (open && !isFormRestored) {
      const savedData = loadFormFromStorage();
      const hasData =
        savedData.name ||
        savedData.description ||
        savedData.words.some(
          (word) => word.english || word.russian || word.description,
        );

      if (hasData) {
        reset(savedData);
        toast.success("Form draft restored");
      }
      setIsFormRestored(true);
    }
  }, [open, isFormRestored, reset]);

  useEffect(() => {
    if (open && isFormRestored) {
      const timeoutId = setTimeout(() => {
        saveFormToStorage(formData);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [formData, open, isFormRestored]);

  const utils = api.useUtils();
  const createGroupMutation = api.groups.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Group "${data.group.name}" created successfully!`);
      void utils.groups.getPaginated.invalidate();
      void utils.statistics.getOverall.invalidate();
      void utils.statistics.getToday.invalidate();
      void utils.statistics.getStreak.invalidate();
      clearFormFromStorage();
      setOpen(false);
      reset(getDefaultValues());
      setIsFormRestored(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error creating group");
    },
  });

  const onSubmit = (data: CreateGroupForm) => {
    createGroupMutation.mutate(data);
  };

  const addWord = () => {
    append({ english: "", russian: "", description: "" });
  };

  const removeWord = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setIsFormRestored(false);
    }
  };

  const handleClearDraft = () => {
    clearFormFromStorage();
    reset(getDefaultValues());
    toast.success("Draft cleared");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="mb-2">Add New Group</DialogTitle>
          <div className="flex items-start justify-between gap-4">
            <DialogDescription className="text-left max-w-sm">
              Create a new word group for learning. Add a title, description and
              list of words.
            </DialogDescription>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearDraft}
              className="text-xs"
            >
              Clear Draft
            </Button>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 max-h-[60vh] overflow-y-auto px-2 -mx-2"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              placeholder="e.g., Basic Vocabulary"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the group..."
              {...register("description")}
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Words</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addWord}
                className="flex items-center gap-2"
              >
                <Plus className="size-4" />
                Add Word
              </Button>
            </div>

            {errors.words && (
              <p className="text-sm text-red-500">{errors.words.message}</p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-2 gap-3 p-3 border rounded-lg"
                >
                  <div className="space-y-2">
                    <Label htmlFor={`words.${index}.english`}>
                      English Word
                    </Label>
                    <Input
                      id={`words.${index}.english`}
                      placeholder="hello"
                      {...register(`words.${index}.english`)}
                      className={
                        errors.words?.[index]?.english ? "border-red-500" : ""
                      }
                    />
                    {errors.words?.[index]?.english && (
                      <p className="text-sm text-red-500">
                        {errors.words[index]?.english?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`words.${index}.russian`}>
                      Russian Translation
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`words.${index}.russian`}
                        placeholder="привет"
                        {...register(`words.${index}.russian`)}
                        className={
                          errors.words?.[index]?.russian ? "border-red-500" : ""
                        }
                      />
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeWord(index)}
                          className="px-2"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                    {errors.words?.[index]?.russian && (
                      <p className="text-sm text-red-500">
                        {errors.words[index]?.russian?.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor={`words.${index}.description`}>
                      Description (optional)
                    </Label>
                    <Input
                      id={`words.${index}.description`}
                      placeholder="Additional information about the word..."
                      {...register(`words.${index}.description`)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createGroupMutation.isPending}
            >
              {isSubmitting || createGroupMutation.isPending
                ? "Creating..."
                : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

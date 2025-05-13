import { useEffect, useState } from "react";
import { Button, DropZone, FileTrigger } from "react-aria-components";
import * as style from "./AudioDropzone.css";

interface DropItem {
  file?: File;
  getFile?: () => Promise<File> | File;
}

export interface AudioFile {
  title: string;
  file: File;
  originalFileName: string;
}

const AudioDropzone = ({
  onFilesAdded,
  isMinimized = false,
  isDisabled = false,
}: {
  onFilesAdded: (files: AudioFile[]) => void;
  isMinimized?: boolean;
  isDisabled?: boolean;
}) => {
  const [dropped, setDropped] = useState(false);

  const processAudioFiles = (files: File[]) => {
    const validFiles: AudioFile[] = [];

    for (const file of files) {
      if (file.type.startsWith("audio/")) {
        const fileName = file.name;
        const fileNameWithoutExtension = fileName
          .split(".")
          .slice(0, -1)
          .join(".");

        validFiles.push({
          title: fileNameWithoutExtension,
          file: file,
          originalFileName: fileName,
        });
      }
    }

    if (validFiles.length > 0) {
      // Only set dropped to true if we found valid audio files
      setDropped(true);
      onFilesAdded(validFiles);
      return true;
    }

    return false;
  };

  // Handle files selected via FileTrigger
  const handleSelectFiles = (files: FileList | null) => {
    if (!files) return;
    processAudioFiles(Array.from(files));
  };

  // Handle dropped files
  const handleDrop = (e: {
    type: string;
    items: Array<unknown>;
    dropOperation?: string;
    dataTransfer?: DataTransfer;
  }) => {
    try {
      // Method 1: Handle native dataTransfer (most common in browser drag and drop)
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        processAudioFiles(Array.from(e.dataTransfer.files));
        return;
      }

      // Method 2: Handle React Aria items
      if (e.items && e.items.length > 0) {
        const files: File[] = [];
        const promises: Promise<void>[] = [];

        for (const item of e.items) {
          if (!item || typeof item !== "object") continue;

          const dropItem = item as DropItem;

          // Try to get file from item directly
          if (item instanceof File) {
            files.push(item);
          }
          // Try to get file from getFile method (React Aria pattern)
          else if (typeof dropItem.getFile === "function") {
            const promise = Promise.resolve(dropItem.getFile())
              .then((file) => {
                if (file instanceof File) files.push(file);
              })
              .catch((err) => console.error("Error getting file:", err));

            promises.push(promise);
          }
          // Try to access file property
          else if (dropItem.file instanceof File) {
            files.push(dropItem.file);
          }
        }

        // If we have promises from getFile calls, wait for them
        if (promises.length > 0) {
          Promise.all(promises).then(() => {
            if (files.length > 0) processAudioFiles(files);
          });
          return;
        }

        // Otherwise process any files we found immediately
        if (files.length > 0) {
          processAudioFiles(files);
        }
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };

  const getDisplayText = () => {
    if (!dropped) {
      return "or drop files here";
    }
  };

  const getButtonText = () => {
    if (dropped) {
      return !isMinimized || isDisabled ? "" : "Add more";
    }
    return "Browse to add";
  };

  const getInstructionText = () => {
    if (dropped || isMinimized) return null;
    return (
      <small className={style.instructionText}>
        (supports most audio files, max 30mb each.)
      </small>
    );
  };

  useEffect(() => {
    // Reset dropped state when minimized changes
    setDropped(isMinimized);
  }, [isMinimized]);

  return (
    <DropZone
      className={({ isDropTarget }) =>
        style.dropZone({
          isMinimized: isMinimized,
          isDropTarget: isDropTarget,
          isDisabled: isDisabled,
        })
      }
      getDropOperation={() => "copy"}
      onDrop={handleDrop}
      isDisabled={isDisabled}
    >
      <FileTrigger
        acceptedFileTypes={["audio/*"]}
        allowsMultiple={true}
        onSelect={handleSelectFiles}
      >
        <Button
          className={style.addFilesButton({
            isMinimized: isMinimized,
            isDisabled: isDisabled,
          })}
        >
          {getButtonText()}
        </Button>
      </FileTrigger>
      {getDisplayText()}
      {getInstructionText()}
    </DropZone>
  );
};

export default AudioDropzone;

import { GET_ARTIST } from "@/apollo/queries/userQueries";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@apollo/client";
import {
  Button,
  Cell,
  Checkbox,
  Column,
  type Key,
  Row,
  type Selection,
  Table,
  TableBody,
  TableHeader,
} from "react-aria-components";
import { Link } from "react-router";
import * as styles from "./ManageTracks.css";
// Additional styles for bulk actions toolbar
const additionalStyles = {
  actionsToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    marginBottom: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
  },
  selectedCount: {
    fontSize: "14px",
    color: "#666",
  },
  bulkActions: {
    display: "flex",
    gap: "8px",
  },
  bulkActionSelect: {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  actionButton: {
    padding: "8px 12px",
    borderRadius: "4px",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ddd",
    cursor: "pointer",
  },
};
import { formatTime } from "@/utils/timeAndDate";
import { useEffect, useState } from "react";

// Define track interface that matches the one from GraphQL
interface ArtistTrack {
  id: string;
  title: string;
  audioLength: number;
  createdAt: string;
  recordedAt: string;
}

// Define action types for type safety
type BulkAction = "download" | "share" | "archive" | "";

const ManageTracks = () => {
  const { user } = useAuth();
  const [selectedKeys, setSelectedKeys] = useState<Set<Key>>(new Set<Key>());
  const [hasSelection, setHasSelection] = useState(false);

  // Only run the query if we have a user
  const { data, loading, error } = useQuery(GET_ARTIST, {
    variables: { username: user?.username || "" },
    skip: !user?.username,
    fetchPolicy: "cache-first",
  });

  // Derived state from query data
  const artist = data?.user || null;
  const tracks = (data?.user?.tracks || []) as ArtistTrack[];

  // Update hasSelection when selectedKeys changes
  useEffect(() => {
    setHasSelection(selectedKeys.size > 0);
  }, [selectedKeys]);

  // Handle deleting selected tracks
  const handleDeleteSelected = () => {
    console.log("Deleting tracks:", Array.from(selectedKeys));
    // Implementation would delete tracks via mutation
    // Then clear selection
    setSelectedKeys(new Set<Key>());
  };

  // Handle bulk action selection
  const handleBulkAction = (action: BulkAction) => {
    console.log(`Performing ${action} on tracks:`, Array.from(selectedKeys));
    // Implementation would perform the selected action on the tracks
  };

  // Handle month selection
  const handleMonthChange = (trackId: string, month: string) => {
    console.log(`Track ${trackId} month changed to ${month}`);
    // Implementation would update the track's month via mutation
  };

  // Handle year selection
  const handleYearChange = (trackId: string, year: string) => {
    console.log(`Track ${trackId} year changed to ${year}`);
    // Implementation would update the track's year via mutation
  };

  // Handle selection changes
  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") {
      // Select all tracks
      const allKeys = new Set<Key>(tracks.map((track) => track.id));
      setSelectedKeys(allKeys);
    } else {
      // Convert to Set<Key>
      setSelectedKeys(new Set<Key>(keys as Iterable<Key>));
    }
  };

  // Handle loading and error states
  if (loading) return <div>Loading tracks...</div>;
  if (error) return <div>Error loading tracks: {error.message}</div>;

  return (
    <div className={styles.container}>
      {artist ? (
        <>
          <h2 className={styles.pageHeading}>{artist.username}'s Tracks</h2>
          {tracks.length === 0 ? (
            <div className={styles.emptyStateContainer}>
              <p>You haven't uploaded anything yet</p>
              <Link to="/upload" className={styles.uploadLink}>
                do that now
              </Link>
            </div>
          ) : (
            <>
              {/* Bulk Actions Toolbar */}
              <div style={additionalStyles.actionsToolbar}>
                <div style={additionalStyles.selectedCount}>
                  {hasSelection
                    ? `${selectedKeys.size} tracks selected`
                    : "Select tracks to perform actions"}
                </div>
                <div style={additionalStyles.bulkActions}>
                  <Button
                    style={additionalStyles.actionButton}
                    isDisabled={!hasSelection}
                    onPress={() => handleDeleteSelected()}
                  >
                    Delete Selected
                  </Button>
                  <div className={styles.selectWrapper}>
                    <select
                      style={additionalStyles.bulkActionSelect}
                      disabled={!hasSelection}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkAction(e.target.value as BulkAction);
                          e.target.value = ""; // Reset after action
                        }
                      }}
                      value=""
                    >
                      <option value="" disabled>
                        More Actions...
                      </option>
                      <option value="download">Download</option>
                      <option value="share">Share</option>
                      <option value="archive">Archive</option>
                    </select>
                  </div>
                </div>
              </div>

              <Table
                aria-label="Tracks"
                selectionMode="multiple"
                selectedKeys={selectedKeys}
                onSelectionChange={handleSelectionChange}
                className={styles.tracksList}
              >
                <TableHeader>
                  <Column>
                    <Checkbox slot="selection" />
                  </Column>
                  <Column isRowHeader>Title</Column>
                  <Column>Duration</Column>
                  <Column>Created</Column>
                  <Column>Recorded</Column>
                  <Column>Actions</Column>
                </TableHeader>
                <TableBody>
                  {tracks.map((track: ArtistTrack) => (
                    <Row key={track.id}>
                      <Cell>
                        <Checkbox slot="selection" />
                      </Cell>
                      <Cell className={styles.trackTitle}>{track.title}</Cell>
                      <Cell className={styles.trackDuration}>
                        {formatTime(track.audioLength)}
                      </Cell>
                      <Cell className={styles.trackDate}>
                        {new Date(track.createdAt).toLocaleDateString()}
                      </Cell>
                      <Cell>
                        <div className={styles.selectsContainer}>
                          {/* Month dropdown */}
                          <div className={styles.selectWrapper}>
                            <label
                              htmlFor={`${track.id}_month_select`}
                              className={styles.visuallyHidden}
                            >
                              month
                            </label>
                            <select
                              id={`${track.id}_month_select`}
                              value={String(
                                new Date(track.recordedAt).getMonth(),
                              )}
                              onChange={(e) =>
                                handleMonthChange(track.id, e.target.value)
                              }
                              className={styles.selectField}
                            >
                              {Array.from({ length: 12 }, (_, i) => (
                                <option
                                  key={`${track.id}_${i}_month`}
                                  value={String(i)}
                                >
                                  {new Date(2023, i, 1).toLocaleString(
                                    "default",
                                    {
                                      month: "short",
                                    },
                                  )}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className={styles.selectWrapper}>
                            <label
                              htmlFor={`${track.id}_year_select`}
                              className={styles.visuallyHidden}
                            >
                              year
                            </label>
                            <select
                              id={`${track.id}_year_select`}
                              value={String(
                                new Date(track.recordedAt).getFullYear(),
                              )}
                              onChange={(e) =>
                                handleYearChange(track.id, e.target.value)
                              }
                              className={styles.selectField}
                            >
                              {Array.from({ length: 100 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                  <option
                                    key={`${track.id}_year_${year}`}
                                    value={String(year)}
                                  >
                                    {year}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                      </Cell>
                      <Cell>
                        <button type="button">•••</button>
                      </Cell>
                    </Row>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </>
      ) : (
        <div>No artist data found</div>
      )}
    </div>
  );
};

export default ManageTracks;

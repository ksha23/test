import React, { useState, useLayoutEffect } from 'react';
import { isMobile } from 'react-device-detect';
import Loader from '../Loader/Loader';
import { connect } from 'react-redux';
import { getCanvasAssignments, refreshCanvasAssignments } from '../../store/actions/canvasActions';
import CanvasAssign from '../CanvasAssignment/CanvasAssignment';
import CanvasSidebar from '../CanvasSidebar';

const CanvasList = ({
  assignments,
  isLoading,
  error,
  me,
  getCanvasAssignments,
  refreshCanvasAssignments,
}) => {
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useLayoutEffect(() => {
    if (!assignments || assignments.length === 0) {
      getCanvasAssignments();
    } else refreshCanvasAssignments();

    // refresh data every every 60 seconds
    // const interval = setInterval(() => {
    //   refreshCanvasAssignments();
    // }, 60000);

    // return () => clearInterval(interval);
  }, []);

  const handleGroupSelection = (group) => {
    if (selectedGroups.includes(group)) {
      setSelectedGroups(selectedGroups.filter((selectedGroup) => selectedGroup !== group));
    } else {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return isLoading ? (
    <div className="flex justify-center items-center mt-10">
      <Loader />
    </div>
  ) : (
    <>
      <div className="pt-5 grid grid-cols-4 w-full max-w-7xl text-zinc-700 dark:text-zinc-300">
        {!isLoading && !isMobile && (
          <div className="col-start-1 col-end-2">
            <CanvasSidebar
              selectedGroups={selectedGroups}
              assignments={assignments}
              setSelectedGroups={setSelectedGroups}
              handleGroupSelection={handleGroupSelection}
            />
          </div>
        )}

        <div className={isMobile ? 'col-span-4' : 'col-start-2 col-span-3'}>
          {!isLoading && (
            <div>
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full mb-4 px-4 py-2 border border-slate-400 dark:border-slate-600 bg-transparent rounded-full"
              />
              {assignments.map((assignmentGroup, index) => {
                let courseLink = '';
                if (me && me.canvasAPIUrl.includes('/api/v1')) {
                  courseLink = `${me.canvasAPIUrl.replace('/api/v1', '')}/courses/${
                    assignmentGroup.courseId
                  }`;
                }
                if (isMobile || selectedGroups.includes(assignmentGroup.course)) {
                  return (
                    <div key={index}>
                      <div className="mb-2">
                        {courseLink !== '' ? (
                          <a
                            href={isMobile ? courseLink.replace('https', 'canvas') : courseLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xl text-blue-500 font-bold"
                          >
                            {assignmentGroup.course}
                          </a>
                        ) : (
                          <p className="text-xl font-bold">{assignmentGroup.course}</p>
                        )}
                      </div>

                      {assignmentGroup.assignments.map((assignment, index) => {
                        if (
                          assignment.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                          assignment.completed === false &&
                          assignment.confirmedCompleted === false
                        ) {
                          return <CanvasAssign assignment={assignment} key={index} />;
                        } else {
                          return null;
                        }
                      })}
                      {assignmentGroup.assignments.map((assignment, index) => {
                        if (
                          assignment.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                          assignment.completed === true &&
                          assignment.confirmedCompleted === false
                        ) {
                          return <CanvasAssign assignment={assignment} key={index} />;
                        } else {
                          return null;
                        }
                      })}
                    </div>
                  );
                } else {
                  return null;
                }
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  assignments: state.canvas.assignments,
  isLoading: state.canvas.isLoading,
  error: state.canvas.error,
  me: state.auth.me,
});

export default connect(mapStateToProps, { getCanvasAssignments, refreshCanvasAssignments })(
  CanvasList,
);

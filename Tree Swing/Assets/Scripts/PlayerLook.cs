
using UnityEngine;

public class PlayerLook : MonoBehaviour
{
    private Transform xform_camera;
    private Transform xform_parent;

    private Vector3 local_rotation;

    public float MouseSensitivity = 4f;
    public float OrbitDampening = 10f;

    public bool camera_disable = false;

    //initialization
    void Start()
    {
        xform_camera = transform;
        xform_parent = transform.parent;
    }

    // LateUpdate is called once per frame at the end
    void LateUpdate()
    {
        if (Input.GetKeyDown(KeyCode.LeftShift))
            camera_disable = !camera_disable;

        if(!camera_disable)
        {
            //rotate camera x and y axis
            if(Input.GetAxis("Mouse X") != 0 || Input.GetAxis("Mouse Y") != 0)
            {
                local_rotation.x += Input.GetAxis("Mouse X") * MouseSensitivity;
                local_rotation.y -= Input.GetAxis("Mouse Y") * MouseSensitivity;

                //clamp y rotation to not allow camera to flip
                local_rotation.y = Mathf.Clamp(local_rotation.y, -90f, 90f);
            }
        }

        Quaternion QT = Quaternion.Euler(local_rotation.y, local_rotation.x, 0);
        xform_parent.rotation = Quaternion.Lerp(xform_parent.rotation, QT, Time.deltaTime * OrbitDampening);

    }
}

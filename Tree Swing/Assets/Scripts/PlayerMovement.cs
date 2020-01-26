using UnityEngine;

public class PlayerMovement : MonoBehaviour
{
    public Transform cam;
    public GameManager gameManager;

    private int jumps;
    private Vector2 input;
    private Rigidbody rb;

    public float speed;
    public float jumpPower;

    

    void Start()
    {
        rb = GetComponent<Rigidbody>();
        jumps = 1;
    }

    void Update()
    {
        input = new Vector2(Input.GetAxis("Horizontal"), Input.GetAxis("Vertical"));
        input = Vector2.ClampMagnitude(input, 1);
    
        Vector3 camF = cam.forward;
        Vector3 camR = cam.right;

        camF.y = 0;
        camR.y = 0;
        camF = camF.normalized;
        camR = camR.normalized;


        transform.position += (camF * input.y + camR * input.x) * Time.deltaTime * speed;
    }

    void FixedUpdate()
    {
        if (Input.GetButtonDown("Jump") && jumps > 0)
        {
            rb.AddForce(0, jumpPower, 0, ForceMode.VelocityChange);
            jumps--;
        }
    }

    void OnCollisionEnter(Collision cl)
    {
        if (cl.gameObject.tag == "Environment")
        {
            jumps++;
            if (jumps > 1) jumps = 1;
        }
    }

    void OnTriggerEnter(Collider collider)
    {
        if (collider.tag == "Finish") {
            Invoke("CompleteLevel", 3);
        }

    }

    void CompleteLevel()
    {
        gameManager.CompleteLevel();
    }
}
